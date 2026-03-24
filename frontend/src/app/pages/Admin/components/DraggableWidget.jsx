import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, X } from "lucide-react";

export const DraggableWidget = ({ id, children, isEditing, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
    height: "100%",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative flex h-full ${isEditing ? "ring-2 ring-indigo-500 rounded-2xl" : ""}`}>
      {children}
      {isEditing && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-slate-200/50">
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md cursor-grab active:cursor-grabbing transition-colors flex items-center justify-center"
          >
            <GripHorizontal size={16} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

