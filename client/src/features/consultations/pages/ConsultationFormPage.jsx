import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as consultationApi from "../services/consultationApi";
import * as clientApi from "../../clients/services/clientApi";
import ConsultationForm from "../components/ConsultationForm";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../lib/utils";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/feedback/Spinner";
import ErrorState from "../../../components/feedback/ErrorState";

export default function ConsultationFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [consultation, setConsultation] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const preselectedClientId = searchParams.get("clientId");

  useEffect(() => {
    const load = async () => {
      try {
        const clientsRes = await clientApi.getClients({
          limit: 100,
          status: ["active", "lead"],
        });
        setClients(clientsRes.data);

        if (isEdit) {
          const res = await consultationApi.getConsultation(id);
          setConsultation(res.data.consultation);
        } else if (preselectedClientId) {
          setConsultation({ clientId: preselectedClientId });
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, preselectedClientId]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        const { clientId, ...updates } = data;
        await consultationApi.updateConsultation(id, updates);
        toast("Consultation updated", "success");
      } else {
        await consultationApi.createConsultation(data);
        toast("Consultation created", "success");
      }
      navigate("/consultations");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/consultations" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit Consultation" : "New Consultation"}
        </h2>
      </div>
      <Card>
        <ConsultationForm
          initial={consultation || {}}
          clients={clients}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel={isEdit ? "Update Consultation" : "Create Consultation"}
          lockClient={isEdit || Boolean(preselectedClientId)}
        />
      </Card>
    </div>
  );
}
