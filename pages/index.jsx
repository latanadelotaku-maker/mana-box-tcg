import { useRef, useState } from 'react';

export default function Home(){
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try{
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = s;
      videoRef.current.play();
    }catch(e){
      alert('Camera non disponibile. Usa "Scegli/Scatta foto"');
    }
  }

  const capture = async () => {
    setLoading(true);
    try{
      let blob;
      if (videoRef.current && videoRef.current.readyState >= 2){
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        canvas.getContext('2d').drawImage(videoRef.current,0,0,canvas.width,canvas.height);
        blob = await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.9));
      } else if (fileRef.current && fileRef.current.files[0]){
        blob = fileRef.current.files[0];
      } else {
        alert('Nessuna immagine selezionata');
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append('file', blob, 'capture.jpg');
      const res = await fetch('/api/scan', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(data);
    }catch(err){
      console.error(err);
      setResult({ success:false, error: 'Upload failed' });
    }finally{ setLoading(false); }
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>Mana Box — TCG Scanner</h1>
        <p className="tag">Scan cards: Magic, Pokémon, Yu-Gi-Oh, Digimon, One Piece</p>
      </header>

      <main className="container">
        <div className="scanner">
          <video ref={videoRef} className="viewer" playsInline />
          <canvas ref={canvasRef} style={{display:'none'}} />
          <div className="controls">
            <button onClick={startCamera}>Apri fotocamera</button>
            <button onClick={capture} disabled={loading}>{loading? 'Scanning...':'Scan'}</button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" />
          </div>
        </div>

        <section className="result">
          {result ? (
            <div className="card">
              <h3>{result.card?.name || 'Nessuna'}</h3>
              <p>Set: {result.card?.set || '-'}</p>
              <p>Confidence: {result.confidence || '-'} </p>
            </div>
          ) : (
            <p className="placeholder">Scatta o carica una foto per avviare il riconoscimento</p>
          )}
        </section>
      </main>

      <footer className="footer">Deploy su Vercel consigliato — link nel README</footer>

      <style jsx>{`
        .page{ font-family: Inter, system-ui, -apple-system; min-height:100vh; background: linear-gradient(180deg,#0f172a 0%, #071033 60%); color:#eef2ff; display:flex; flex-direction:column; }
        .hero{ padding:28px 16px; text-align:center; }
        h1{ margin:0; font-size:22px; letter-spacing:1px }
        .tag{ margin-top:6px; color:#9aa7d1 }
        .container{ flex:1; padding:12px; display:flex; gap:16px; flex-direction:column; align-items:center }
        .scanner{ width:100%; max-width:420px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:12px }
        .viewer{ width:100%; background:#000; border-radius:8px; min-height:220px }
        .controls{ display:flex; gap:8px; margin-top:8px; }
        button{ background:linear-gradient(90deg,#6d28d9,#06b6d4); color:white; border:none; padding:10px 12px; border-radius:8px }
        input[type=file]{ background:transparent; color:#cbd5e1 }
        .result{ width:100%; max-width:420px }
        .card{ background:rgba(255,255,255,0.03); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.04) }
        .placeholder{ color:#9aa7d1 }
        .footer{ text-align:center; padding:12px; font-size:13px; color:#94a3b8 }
        @media(min-width:800px){ .container{ flex-direction:row; justify-content:center } }
      `}</style>
    </div>
  )
}
