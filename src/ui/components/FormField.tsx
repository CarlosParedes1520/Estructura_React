const FormField = ({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default FormField;
