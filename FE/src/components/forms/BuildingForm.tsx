import React, { useState, useEffect } from "react";
import { X, Building2, MapPin, Save, Phone, Mail, FileText, FileWarning, Image as ImageIcon } from "lucide-react";
import type { Building, BuildingPayload } from "@/api/buildingApi";

interface BuildingFormProps {
    building: Building | null;
    onSubmit: (data: BuildingPayload) => void;
    onClose: () => void;
    isSubmitting: boolean;
}

export const BuildingForm: React.FC<BuildingFormProps> = ({
    building,
    onSubmit,
    onClose,
    isSubmitting
}) => {
    const [buildingName, setBuildingName] = useState("");
    const [address, setAddress] = useState("");
    const [hotline, setHotline] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [parkingRules, setParkingRules] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (building) {
            setBuildingName(building.buildingName);
            setAddress(building.address);
            setHotline(building.hotline || "");
            setEmail(building.email || "");
            setDescription(building.description || "");
            setParkingRules(building.parkingRules || "");
            setAvatarUrl(building.avatarUrl || "");
        } else {
            setBuildingName("");
            setAddress("");
            setHotline("");
            setEmail("");
            setDescription("");
            setParkingRules("");
            setAvatarUrl("");
        }
        setErrors({});
    }, [building]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!buildingName.trim()) {
            newErrors.buildingName = "Tên tòa nhà không được bỏ trống";
        } else if (buildingName.length < 2 || buildingName.length > 150) {
            newErrors.buildingName = "Tên tòa nhà phải từ 2 đến 150 ký tự";
        }

        if (!address.trim()) {
            newErrors.address = "Địa chỉ không được bỏ trống";
        } else if (address.length < 5 || address.length > 255) {
            newErrors.address = "Địa chỉ phải từ 5 đến 255 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                buildingName: buildingName.trim(),
                address: address.trim(),
                hotline: hotline.trim(),
                email: email.trim(),
                description: description.trim(),
                parkingRules: parkingRules.trim(),
                avatarUrl: avatarUrl.trim()
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        {building ? "Cập nhật tòa nhà" : "Thêm tòa nhà mới"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Building Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            Tên tòa nhà
                        </label>
                        <input
                            type="text"
                            value={buildingName}
                            onChange={(e) => setBuildingName(e.target.value)}
                            placeholder="Ví dụ: Tòa nhà A, Keangnam..."
                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${errors.buildingName
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                        />
                        {errors.buildingName && <p className="mt-1 text-xs text-red-500">{errors.buildingName}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ví dụ: 123 Đường Cầu Giấy, Hà Nội..."
                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${errors.address
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                        />
                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Hotline */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                                <Phone className="h-4 w-4 text-slate-400" />
                                Hotline
                            </label>
                            <input
                                type="tel"
                                value={hotline}
                                onChange={(e) => setHotline(e.target.value)}
                                placeholder="090123..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                                <Mail className="h-4 w-4 text-slate-400" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="abc@email.com"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                            Ảnh đại diện (URL)
                        </label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                            <FileText className="h-4 w-4 text-slate-400" />
                            Mô tả tòa nhà
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                        />
                    </div>

                    {/* Rules */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                            <FileWarning className="h-4 w-4 text-slate-400" />
                            Quy định gửi xe
                        </label>
                        <textarea
                            value={parkingRules}
                            onChange={(e) => setParkingRules(e.target.value)}
                            placeholder="Nhập quy định..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Lưu lại
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
