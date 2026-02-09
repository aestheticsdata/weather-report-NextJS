"use client";

import { useState, useEffect } from "react";
import { WeatherReport, UserType, ErrorModal, WeatherFormData } from "./types";
import ErrorModalComponent from "./components/ErrorModal";
import WeatherFormModal from "./components/WeatherFormModal";
import WeatherDisplay from "./components/WeatherDisplay";
import WeatherHeader from "./components/WeatherHeader";

export default function Home() {
  const [reports, setReports] = useState<WeatherReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>("authenticated");
  const [errorModal, setErrorModal] = useState<ErrorModal>({ show: false, message: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState<WeatherReport | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [formData, setFormData] = useState<WeatherFormData>({
    city: "",
    country: "",
    temperature: "",
    condition: "sunny",
    userId: "user-1",
  });

  const AUTH_TOKEN = "JOECOOL123";

  // Fetch reports on startup (initialization is now done server-side)
  useEffect(() => {
    async function loadData() {
      try {
        await fetchReports();
      } catch (error) {
        console.error("Failed to load data", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load weather data";
        setErrorModal({
          show: true,
          message: `${errorMessage}\n\nMake sure the weather API is running on http://127.0.0.1:6000`,
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Update selected report when reports change
  useEffect(() => {
    if (reports.length > 0) {
      if (selectedReportId) {
        const report = reports.find((r) => r.id === selectedReportId);
        if (report) {
          // Always update to get the latest data, even if it's the same report
          setSelectedReport(report);
        }
        return;
      }
      if (reports[0]) {
        setSelectedReportId(reports[0].id);
        setSelectedReport(reports[0]);
      }
    } else {
      setSelectedReport(null);
      setSelectedReportId("");
    }
  }, [reports, selectedReportId]);

  const fetchReports = async (): Promise<WeatherReport[] | null> => {
    try {
      const res = await fetch("/api/weather");
      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = errorData.error || "Failed to fetch reports";
        const details = errorData.details ? `\n\nDetails: ${errorData.details}` : "";
        const hint = errorData.hint ? `\n\n${errorData.hint}` : "";
        throw new Error(`${errorMsg}${details}${hint}`);
      }
      const data = await res.json();
      setReports(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch reports", error);
      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "Failed to fetch weather reports",
      });
      return null;
    }
  };

  const handleReportChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reportId = e.target.value;
    
    // Fade out
    setIsFading(true);
    
    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update the report
    setSelectedReportId(reportId);
    const report = reports.find((r) => r.id === reportId);
    setSelectedReport(report || null);
    
    // Fade in
    setTimeout(() => {
      setIsFading(false);
    }, 50);
  };

  const handleDelete = async (id: string) => {
    if (userType !== "authenticated") {
      setErrorModal({
        show: true,
        message: "Authentication required to delete reports",
      });
      return;
    }

    try {
      const res = await fetch(`/api/weather/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-weather": AUTH_TOKEN,
        },
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error: ${res.status} ${res.statusText}` };
        }
        const errorMsg = errorData.error || errorData.message || "Failed to delete report";
        const details = errorData.details ? `\n\nDetails: ${errorData.details}` : "";
        const hint = errorData.hint ? `\n\n${errorData.hint}` : "";
        throw new Error(`${errorMsg}${details}${hint}`);
      }

      // Refresh reports and update selection if needed
      const deletedReportId = id;
      const updatedReports = await fetchReports();
      
      // If we deleted the currently selected report, select the first one
      if (selectedReportId === deletedReportId) {
        if (updatedReports && updatedReports.length > 0) {
          setSelectedReportId(updatedReports[0].id);
          setSelectedReport(updatedReports[0]);
        } else {
          setSelectedReport(null);
          setSelectedReportId("");
        }
      }
    } catch (error) {
      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "Failed to delete report",
      });
    }
  };

  const handleDeleteAll = async () => {
    if (userType !== "authenticated") {
      setErrorModal({
        show: true,
        message: "Authentication required to delete all reports",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete all weather reports?")) {
      return;
    }

    try {
      const res = await fetch("/api/weather", {
        method: "DELETE",
        headers: {
          "x-auth-weather": AUTH_TOKEN,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = errorData.error || errorData.message || "Failed to delete all reports";
        const details = errorData.details ? `\n\nDetails: ${errorData.details}` : "";
        const hint = errorData.hint ? `\n\n${errorData.hint}` : "";
        throw new Error(`${errorMsg}${details}${hint}`);
      }

      await fetchReports();
    } catch (error) {
      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "Failed to delete all reports",
      });
    }
  };

  const handleEdit = (report: WeatherReport) => {
    if (userType !== "authenticated") {
      setErrorModal({
        show: true,
        message: "Authentication required to edit reports",
      });
      return;
    }

    setEditingReport(report);
    const newFormData = {
      city: report.city,
      country: report.country,
      temperature: report.temperature.toString(),
      condition: report.condition,
      userId: report.user?.id || report.userId || "",
    };
    setFormData(newFormData);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    if (userType !== "authenticated") {
      setErrorModal({
        show: true,
        message: "Authentication required to create reports",
      });
      return;
    }

    setEditingReport(null);
    setFormData({
      city: "",
      country: "",
      temperature: "",
      condition: "sunny",
      userId: "user-1",
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userType !== "authenticated") {
      setErrorModal({
        show: true,
        message: "Authentication required",
      });
      return;
    }

    const temperature = parseFloat(formData.temperature);
    if (isNaN(temperature) || temperature < -70 || temperature > 50) {
      setErrorModal({
        show: true,
        message: "Temperature must be between -70 and 50 degrees",
      });
      return;
    }

    try {
      const payload = {
        city: formData.city,
        country: formData.country,
        temperature: temperature,
        condition: formData.condition,
        userId: formData.userId,
      };

      let res;
      if (editingReport) {
        res = await fetch(`/api/weather/${editingReport.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-auth-weather": AUTH_TOKEN,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/weather", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-weather": AUTH_TOKEN,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || data.message || "Failed to save report";
        const details = data.details ? `\n\nDetails: ${data.details}` : "";
        const hint = data.hint ? `\n\n${data.hint}` : "";
        throw new Error(`${errorMsg}${details}${hint}`);
      }

      // Close modals and reset form
      setShowEditModal(false);
      setShowCreateModal(false);
      const updatedReportId = editingReport?.id;
      const isNewReport = !editingReport;
      const newReportId = isNewReport ? data.id : null;
      setEditingReport(null);
      setFormData({
        city: "",
        country: "",
        temperature: "",
        condition: "sunny",
        userId: "user-1",
      });
      
      // Refresh the reports list
      const updatedReports = await fetchReports();
      
      if (updatedReports) {
        if (isNewReport && newReportId) {
          // If it's a new report, select it
          const newReport = updatedReports.find((r) => r.id === newReportId);
          if (newReport) {
            setSelectedReportId(newReportId);
            setSelectedReport(newReport);
          }
        } else if (updatedReportId) {
          // If it's an edit, update the selected report
          const updatedReport = updatedReports.find((r) => r.id === updatedReportId);
          if (updatedReport) {
            setSelectedReport(updatedReport);
          }
        }
      }
    } catch (error) {
      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "Failed to save report",
      });
    }
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setEditingReport(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-pulse text-xl">Loading Weather...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
        <WeatherHeader
          reports={reports}
          selectedReportId={selectedReportId}
          userType={userType}
          selectedReport={selectedReport}
          onReportChange={handleReportChange}
          onUserTypeChange={setUserType}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
        />

        {selectedReport && (
          <WeatherDisplay report={selectedReport} isFading={isFading} />
        )}

        {!selectedReport && (
          <div className="p-8 text-center text-gray-400">
            No weather reports available. Create one to get started!
          </div>
        )}
      </div>

      <ErrorModalComponent
        errorModal={errorModal}
        onClose={() => setErrorModal({ show: false, message: "" })}
      />

      <WeatherFormModal
        key={editingReport?.id || "create"}
        show={showEditModal || showCreateModal}
        editingReport={editingReport}
        formData={formData}
        onClose={handleCloseModals}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      <div className="mt-8 text-gray-500 text-sm">
        Powered by Next.js 16 & Tailwind
      </div>
    </main>
  );
}
