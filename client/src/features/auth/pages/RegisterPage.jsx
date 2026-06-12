import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Calendar, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../lib/utils";
import Input from "../../../components/ui/Input";
import PasswordInput from "../../../components/ui/PasswordInput";
import Button from "../../../components/ui/Button";
import { isPasswordValid } from "../utils/passwordValidation";

const showValidationToasts = (error, toast) => {
  const data = error?.response?.data;
  if (data?.errors?.length) {
    data.errors.forEach((item) => toast(item.message, "error"));
    return;
  }
  toast(getErrorMessage(error), "error");
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) {
        error = "Full name is required";
      }
    }
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Please enter a valid email address";
      }
    }
    if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (!isPasswordValid(value)) {
        error =
          "Password must be at least 8 characters long and contain 1 uppercase letter, 1 lowercase letter and 1 number";
      }
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTouched = {
      name: true,
      email: true,
      password: true,
      phone: true,
    };

    setTouched(newTouched);

    const nameErr = validateField("name", form.name);
    const emailErr = validateField("email", form.email);
    const passErr = validateField("password", form.password);

    if (nameErr || emailErr || passErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
      });

      toast(
        passErr ||
          nameErr ||
          emailErr ||
          "Please correct the highlighted fields",
        "error",
      );

      return;
    }

    setLoading(true);

    try {
      const payload = { ...form };

      if (!payload.phone) {
        delete payload.phone;
      }

      await register(payload);

      toast("Account created successfully! Welcome to AstroCRM.", "success");

      navigate("/dashboard");
    } catch (err) {
      showValidationToasts(err, toast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Left decoration panel - Desktop Only */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 p-12 text-white lg:flex border-r border-slate-800/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
            AstroCRM
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            Join professional astrologers worldwide.
          </h2>
          <p className="text-lg text-slate-400">
            Create your account today and unlock a modern client database,
            automatic session notes, and smart callback schedules.
          </p>
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <Calendar className="h-5 w-5 shrink-0 text-brand-400" />
              <div>
                <p className="font-semibold text-sm">Session Tracking</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Easily log notes and pricing for consultations.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-sm">Privacy Guaranteed</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  We encrypt your logs and client listings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel containing register form */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.04)_0,transparent_100%)] pointer-events-none lg:left-1/2" />

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AstroCRM
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Create your astrologer account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-850 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 hidden lg:block">
              <h3 className="text-xl font-bold text-white">Create Account</h3>
              <p className="text-sm text-slate-400 mt-1">
                Get started with a free CRM workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                error={touched.name ? errors.name : ""}
                placeholder="Full Name"
                className="[&>input]:bg-slate-950/50 [&>input]:border-slate-800 [&>input]:text-white [&>input]:placeholder:text-slate-650 [&>label]:text-slate-400 [&>input]:focus:border-brand-500"
              />
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                error={touched.email ? errors.email : ""}
                placeholder="example@gmail.com"
                className="[&>input]:bg-slate-950/50 [&>input]:border-slate-800 [&>input]:text-white [&>input]:placeholder:text-slate-650 [&>label]:text-slate-400 [&>input]:focus:border-brand-500"
              />
              <Input
                label="Phone (optional)"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+ 000 000 0000"
                className="[&>input]:bg-slate-950/50 [&>input]:border-slate-800 [&>input]:text-white [&>input]:placeholder:text-slate-650 [&>label]:text-slate-400 [&>input]:focus:border-brand-500"
              />
              <div>
                <PasswordInput
                  label="Password"
                  required
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  error={touched.password ? errors.password : ""}
                  placeholder="Create a password"
                  className="[&>div>input]:bg-slate-950/50 [&>div>input]:border-slate-800 [&>div>input]:text-white [&>div>input]:placeholder:text-slate-650 [&>label]:text-slate-400 [&>div>input]:focus:border-brand-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4 py-3"
                loading={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-5 border-t border-slate-800/80 pt-5 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-400 hover:text-brand-350 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
