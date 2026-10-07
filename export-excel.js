/* Local Excel export: no registration data is sent to another service. */
(function(scope){
 const xml=v=>String(v??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
 const formula=(f,v)=>({formula:f,value:v});
 const normal=v=>String(v).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
 function prepare(data,minimum){
  const grouped=new Map(),detail=[];
  for(const r of data.registrations){
   const s=data.sessions.find(s=>s.id===r.session_id)||r.session;if(!s)throw new Error('Un créneau manque dans le planning. Actualisez le suivi.');
   const excluded=r.retired||s.status==='cancelled',confirmed=!excluded&&s.status==='confirmed'&&s.count>=minimum;
   const donation=s.price==='don'||s.price==='tiny3'&&r.licence==='NC';
   const amount=donation?null:s.price==='tiny3'?4:Number(s.price);
   if(amount!==null&&(!Number.isFinite(amount)||amount<0))throw new Error('Un tarif est invalide. Vérifiez le planning.');
   const fixed=excluded?0:amount??0,confirmedAmount=confirmed?fixed:0,pendingAmount=excluded||confirmed?0:fixed;
   const status=excluded?'Annulée / retirée':confirmed?'Confirmée':s.status==='confirmed'?'À reconfirmer (moins de 5 inscrits)':'En attente de confirmation';
   const row=detail.length+5;
   detail.push([s.date,s.start,s.end,s.group,r.name,r.group_name,r.email,r.price,fixed,confirmedAmount,pendingAmount,status,excluded?'Exclue des totaux':donation?'Don libre non chiffré':amount===0?'Séance gratuite':'']);
   const key=normal(r.name)+'|'+normal(r.email);
   if(!grouped.has(key))grouped.set(key,{name:r.name,email:r.email.trim().toLowerCase(),groups:new Set(),active:0,total:0,confirmed:0,pending:0,donations:0,cancelled:0,rows:[]});
   const g=grouped.get(key);g.groups.add(r.group_name);g.rows.push(row);g.total+=fixed;g.confirmed+=confirmedAmount;g.pending+=pendingAmount;if(excluded)g.cancelled++;else{g.active++;if(donation)g.donations++;}
  }
  const sum=(rows,column,value)=>formula('SUM('+rows.map(n=>`Inscriptions!${column}${n}`).join(',')+')',value);
  const groups=[...grouped.values()].sort((a,b)=>a.name.localeCompare(b.name,'fr')||a.email.localeCompare(b.email));
  const summary=groups.map(g=>[g.name,[...g.groups].join(', '),g.email,g.active,sum(g.rows,'I',g.total),sum(g.rows,'J',g.confirmed),sum(g.rows,'K',g.pending),g.donations,[g.donations?'Dons libres à définir, exclus des montants':'',g.cancelled?`${g.cancelled} inscription(s) annulée(s), exclue(s)`: ''].filter(Boolean).join('. ')]);
  return {summary,detail,groups};
 }
 function sheet(name,title,note,headers,rows,widths,moneyCols){
  const all=[[title],[note],[],headers,...rows];
  const body=all.map((row,i)=>`<row r="${i+1}"${i===0?' ht="28" customHeight="1"':i===1?' ht="42" customHeight="1"':i===3?' ht="34" customHeight="1"':''}>${row.map((v,j)=>{const ref=col(j)+(i+1),style=i===0?1:i===1?4:i===3?2:moneyCols.includes(j)?3:0;if(v&&typeof v==='object'&&'formula'in v)return `<c r="${ref}" s="${style}"><f>${xml(v.formula)}</f><v>${v.value}</v></c>`;return typeof v==='number'?`<c r="${ref}" s="${style}"><v>${v}</v></c>`:`<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;}).join('')}</row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w,j)=>`<col min="${j+1}" max="${j+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${body}</sheetData><autoFilter ref="A4:${col(headers.length-1)}${Math.max(4,rows.length+4)}"/><mergeCells count="2"><mergeCell ref="A1:${col(headers.length-1)}1"/><mergeCell ref="A2:${col(headers.length-1)}2"/></mergeCells></worksheet>`;
 }
 const styles=`<?xml version="1.0"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00 &quot;€&quot;"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="18"/><color rgb="FF087E9E"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF087E9E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="5"><xf fontId="0" fillId="0" borderId="0" xfId="0"/><xf fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
 const encoder=new TextEncoder();
 const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 function crc(bytes){let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
 function zip(files){
  const chunks=[],directory=[];let offset=0,centralSize=0;
  for(const [path,text]of Object.entries(files)){
   const name=encoder.encode(path),bytes=encoder.encode(text),checksum=crc(bytes);
   const local=new Uint8Array(30+name.length),v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,checksum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);local.set(name,30);
   const central=new Uint8Array(46+name.length),c=new DataView(central.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint32(16,checksum,true);c.setUint32(20,bytes.length,true);c.setUint32(24,bytes.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);central.set(name,46);
   chunks.push(local,bytes);directory.push(central);offset+=local.length+bytes.length;centralSize+=central.length;
  }
  const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,directory.length,true);e.setUint16(10,directory.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
  return new Blob([...chunks,...directory,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 }
 function create(data,minimum=5){
  const {summary,detail}=prepare(data,minimum);
  const files={
   '[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
   '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
   'xl/workbook.xml':'<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Totaux par adhérent" sheetId="1" r:id="rId1"/><sheet name="Inscriptions" sheetId="2" r:id="rId2"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>',
   'xl/_rels/workbook.xml.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
   'xl/styles.xml':styles,
   'xl/worksheets/sheet1.xml':sheet('Totaux par adhérent','ROC · Totaux par adhérent · Toussaint 2026','Total prévu : créneaux ouverts et confirmés. Pour préparer les factures, utilisez le montant confirmé. Les sessions annulées et les dons libres sont exclus des montants.', ['Nageur','Groupe','E-mail de contact','Créneaux actifs','Total prévu (€)','Dont confirmé (€)','Dont en attente (€)','Dons libres (séances)','À vérifier'],summary,[28,25,36,18,20,22,22,22,55],[4,5,6]),
   'xl/worksheets/sheet2.xml':sheet('Inscriptions','ROC · Détail des inscriptions · Toussaint 2026',`Export du ${new Date().toLocaleDateString('fr-FR')} · Source : inscriptions du club et tarifs du planning. Les dons libres n’ont pas de montant défini.`,['Date','Début','Fin','Stage','Nageur','Groupe','E-mail de contact','Tarif prévu','Montant prévu (€)','Confirmé (€)','En attente (€)','Statut','Prise en compte'],detail,[14,10,10,27,28,25,36,18,22,19,19,40,32],[8,9,10])
  };
  return zip(files);
 }
 scope.ROCExcel={create,prepare};
})(typeof window==='undefined'?globalThis:window);
