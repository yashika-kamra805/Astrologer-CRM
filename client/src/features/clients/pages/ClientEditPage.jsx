import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as clientApi from '../services/clientApi';
import ClientForm from '../components/ClientForm';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../lib/utils';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/feedback/Spinner';
import ErrorState from '../../../components/feedback/ErrorState';

export default function ClientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientApi
      .getClient(id)
      .then((res) => setClient(res.data.client))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await clientApi.updateClient(id, data);
      toast('Client updated', 'success');
      navigate(`/clients/${id}`);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!client) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/clients/${id}`} className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Edit Client</h2>
      </div>
      <Card>
        <ClientForm
          initial={client}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Update Client"
        />
      </Card>
    </div>
  );
}
