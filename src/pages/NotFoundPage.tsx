import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="card text-center space-y-3">
      <h1 className="text-2xl font-bold text-brand-700">העמוד לא נמצא</h1>
      <p className="text-slate-600">נראה שהקישור לא תקין או שהעמוד הוסר.</p>
      <Link to="/" className="btn-primary">
        חזרה לדשבורד
      </Link>
    </div>
  );
}
