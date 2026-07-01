"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Edit3, Save, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicalNotesProps {
  patientId: string;
  initialNotes: string | null;
}

export function MedicalNotes({ patientId, initialNotes }: MedicalNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicalNotes: notes }),
        });

        if (!res.ok) throw new Error("Failed to save notes");
        
        toast.success("Medical notes updated");
        setIsEditing(false);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-sm mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500" />
          Medical Notes & Allergies
        </h3>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 text-slate-500 hover:text-slate-900 px-3 rounded-lg"
          >
            <Edit3 className="w-4 h-4 mr-1.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setNotes(initialNotes || "");
              }}
              disabled={isPending}
              className="h-8 text-slate-500 hover:text-red-600 px-3 rounded-lg"
            >
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className="h-8 bg-slate-900 text-white hover:bg-slate-800 px-3 rounded-lg"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Save className="w-3 h-3 mr-1.5" />}
              Save
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter allergies, chronic conditions, or important medical history..."
          className="min-h-[100px] w-full resize-none border-slate-200 focus-visible:ring-slate-200 bg-white rounded-md p-3 border text-sm"
        />
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-[100px]">
          {notes ? (
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">No medical notes recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
