import { useTranslation } from "react-i18next";

export default function Divider() {
  const { t } = useTranslation("auth");
  return (
    <div className="flex items-center py-6">
      <div className="h-px flex-1 bg-gray-200" />

      <span className="mx-4 text-sm text-gray-500">
        {t('auth:divider.text')}
      </span>

      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}