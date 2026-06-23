import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

function parseForm(req){
  const form = new formidable.IncomingForm();
  return new Promise((res, rej)=>{
    form.parse(req, (err, fields, files) => {
      if (err) return rej(err);
      res({ fields, files });
    });
  });
}

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  try{
    const { fields, files } = await parseForm(req);
    const f = files.file;
    // Basic heuristic: check filename or field for keywords
    const name = (f && f.originalFilename) ? f.originalFilename.toLowerCase() : '';
    const body = fields || {};
    const check = (s)=> name.includes(s) || (body.name && body.name.toLowerCase().includes(s));
    const sets = [
      { key:'magic', names:['black','magic','lotus'] },
      { key:'pokemon', names:['pikachu','pokemon','poke'] },
      { key:'yugioh', names:['blue','yu','yugi','eyes'] },
      { key:'digimon', names:['agumon','digimon'] },
      { key:'one-piece', names:['luffy','onepiece','one-piece'] }
    ];
    let found = null;
    for(const s of sets){
      for(const n of s.names){ if (check(n)){ found = s.key; break; } }
      if (found) break;
    }
    // Remove temp file
    if (f && f.filepath && fs.existsSync(f.filepath)) fs.unlinkSync(f.filepath);

    if (found) return res.json({ success:true, card:{ name: 'Detected sample', set: found }, confidence:0.86 });
    // fallback random
    const sample = [ ['Black Lotus','magic'], ['Pikachu','pokemon'], ['Blue-Eyes White Dragon','yugioh'], ['Agumon','digimon'], ['Luffy','one-piece'] ];
    const pick = sample[Math.floor(Math.random()*sample.length)];
    return res.json({ success:true, card:{ name: pick[0], set: pick[1] }, confidence: 0.45 });
  }catch(err){
    console.error(err);
    res.status(500).json({ success:false, error:'server error' });
  }
}
