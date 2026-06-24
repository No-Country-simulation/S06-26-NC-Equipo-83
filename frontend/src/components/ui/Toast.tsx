import toast from "react-hot-toast";

export function showSuccess(message: string) {
  toast.success(message, { duration: 4000, position: "top-right", style: { borderRadius: "12px", background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", fontSize: "14px", fontWeight: 500 } });
}

export function showError(message: string) {
  toast.error(message, { duration: 5000, position: "top-right", style: { borderRadius: "12px", background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: "14px", fontWeight: 500 } });
}

export function showInfo(message: string) {
  toast(message, { duration: 3000, position: "top-right", style: { borderRadius: "12px", background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE", fontSize: "14px", fontWeight: 500 } });
}
