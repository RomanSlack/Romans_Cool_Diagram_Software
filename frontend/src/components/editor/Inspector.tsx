"use client";

import { useState } from "react";
import { useDiagramStore } from "@/lib/store/diagramStore";
import { useProjectsStore } from "@/lib/store/projectsStore";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  NodeElement,
  TextElement,
  ContainerElement,
  EdgeElement,
  NODE_PRESETS,
  FONT_OPTIONS,
} from "@/lib/schema/types";
import {
  Download,
  FileImage,
  FileCode,
  FileText,
  Grid3X3,
  Palette,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  GalleryHorizontal,
  GalleryVertical,
} from "lucide-react";

export function Inspector() {
  const { diagram, selectedIds, updateElement, updateCanvas, alignElements, distributeElements } = useDiagramStore();
  const { saveProject } = useProjectsStore();
  const [activeTab, setActiveTab] = useState<"canvas" | "export">("canvas");

  // Get selected elements
  const selectedElements = diagram.elements.filter((e) => selectedIds.includes(e.id));
  const selectedElement = selectedIds.length === 1 ? selectedElements[0] : null;
  const hasMultipleSelected = selectedIds.length > 1;
  const nonEdgeSelectedCount = selectedElements.filter((e) => e.type !== "edge").length;

  // Show multi-select panel when multiple elements are selected
  if (hasMultipleSelected) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {selectedIds.length} Elements Selected
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pb-16">
          <div className="p-4 space-y-6">
            {/* Alignment */}
            <Section title="Align">
              <div className="grid grid-cols-3 gap-1">
                <AlignButton
                  onClick={() => alignElements("left")}
                  disabled={nonEdgeSelectedCount < 2}
                  tooltip="Align Left"
                >
                  <AlignLeft size={16} />
                </AlignButton>
                <AlignButton
                  onClick={() => alignElements("center")}
                  disabled={nonEdgeSelectedCount < 2}
                  tooltip="Align Center"
                >
                  <AlignCenter size={16} />
                </AlignButton>
                <AlignButton
                  onClick={() => alignElements("right")}
                  disabled={nonEdgeSelectedCount < 2}
                  tooltip="Align Right"
                >
                  <AlignRight size={16} />
                </AlignButton>
                <AlignButton
                  onClick={() => alignElements("top")}
                  disabled={nonEdgeSelectedCount < 2}
                  tooltip="Align Top"
                >
                  <AlignStartVertical size={16} />
                </AlignButton>
                <AlignButton
                  onClick={() => alignElements("middle")}
                  disabled={nonEdgeSelectedCount < 2}
                  tooltip="Align Middle"
                >
                  <AlignCenterVertical size={16} />
                </AlignButton>
                <AlignButton
                  onClick={() => alignElements("bottom")}
                  disabled={nonEdgeSelectedCount < 2}
                  tooltip="Align Bottom"
                >
                  <AlignEndVertical size={16} />
                </AlignButton>
              </div>
            </Section>

            {/* Distribution */}
            <Section title="Distribute">
              <div className="grid grid-cols-2 gap-1">
                <AlignButton
                  onClick={() => distributeElements("horizontal")}
                  disabled={nonEdgeSelectedCount < 3}
                  tooltip="Distribute Horizontally"
                  wide
                >
                  <GalleryHorizontal size={16} />
                  <span className="text-xs ml-1">Horizontal</span>
                </AlignButton>
                <AlignButton
                  onClick={() => distributeElements("vertical")}
                  disabled={nonEdgeSelectedCount < 3}
                  tooltip="Distribute Vertically"
                  wide
                >
                  <GalleryVertical size={16} />
                  <span className="text-xs ml-1">Vertical</span>
                </AlignButton>
              </div>
              {nonEdgeSelectedCount < 3 && (
                <p className="text-xs text-gray-400 mt-2">
                  Select 3+ elements to distribute
                </p>
              )}
            </Section>

            {/* Selection info */}
            <Section title="Selection">
              <div className="text-xs text-gray-500 space-y-1">
                {selectedElements.filter((e) => e.type === "node").length > 0 && (
                  <p>{selectedElements.filter((e) => e.type === "node").length} nodes</p>
                )}
                {selectedElements.filter((e) => e.type === "text").length > 0 && (
                  <p>{selectedElements.filter((e) => e.type === "text").length} text elements</p>
                )}
                {selectedElements.filter((e) => e.type === "container").length > 0 && (
                  <p>{selectedElements.filter((e) => e.type === "container").length} containers</p>
                )}
                {selectedElements.filter((e) => e.type === "edge").length > 0 && (
                  <p>{selectedElements.filter((e) => e.type === "edge").length} edges</p>
                )}
              </div>
            </Section>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <p>Shift+click to add/remove elements from selection. Press Delete to remove selected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Inspector
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === "canvas"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Palette size={12} />
              Canvas
            </span>
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === "export"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Download size={12} />
              Export
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-16">
          {activeTab === "canvas" ? (
            <CanvasInspector
              canvas={diagram.canvas}
              diagramName={diagram.name}
              onChange={updateCanvas}
              onNameChange={(name) => {
                // Update diagram name in store
                useDiagramStore.setState((state) => ({
                  diagram: { ...state.diagram, name },
                }));
              }}
            />
          ) : (
            <ExportPanel diagram={diagram} onSave={() => saveProject(diagram)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {getElementTypeName(selectedElement.type)}
        </h2>
      </div>

      <div key={selectedElement.id} className="flex-1 overflow-y-auto animate-fade-in pb-16">
        {selectedElement.type === "node" && (
          <NodeInspector
            element={selectedElement as NodeElement}
            onChange={(updates) => updateElement(selectedElement.id, updates)}
          />
        )}
        {selectedElement.type === "text" && (
          <TextInspector
            element={selectedElement as TextElement}
            onChange={(updates) => updateElement(selectedElement.id, updates)}
          />
        )}
        {selectedElement.type === "container" && (
          <ContainerInspector
            element={selectedElement as ContainerElement}
            onChange={(updates) => updateElement(selectedElement.id, updates)}
          />
        )}
        {selectedElement.type === "edge" && (
          <EdgeInspector
            element={selectedElement as EdgeElement}
            onChange={(updates) => updateElement(selectedElement.id, updates)}
          />
        )}
      </div>
    </div>
  );
}

function getElementTypeName(type: string): string {
  const names: { [key: string]: string } = {
    node: "Node",
    text: "Text",
    container: "Container",
    edge: "Edge",
  };
  return names[type] || type;
}

// ============ NODE INSPECTOR ============

interface NodeInspectorProps {
  element: NodeElement;
  onChange: (updates: Partial<NodeElement>) => void;
}

function NodeInspector({ element, onChange }: NodeInspectorProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Content */}
      <Section title="Content">
        <Field label="Title">
          <input
            type="text"
            value={element.content.title}
            onChange={(e) =>
              onChange({ content: { ...element.content, title: e.target.value } })
            }
            className="input"
          />
        </Field>
        <Field label="Subtitle">
          <input
            type="text"
            value={element.content.subtitle || ""}
            onChange={(e) =>
              onChange({ content: { ...element.content, subtitle: e.target.value } })
            }
            className="input"
          />
        </Field>
      </Section>

      {/* Position & Size */}
      <Section title="Transform">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X">
            <input
              type="number"
              value={Math.round(element.position.x)}
              onChange={(e) =>
                onChange({ position: { ...element.position, x: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Y">
            <input
              type="number"
              value={Math.round(element.position.y)}
              onChange={(e) =>
                onChange({ position: { ...element.position, y: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Width">
            <input
              type="number"
              value={Math.round(element.size.width)}
              onChange={(e) =>
                onChange({ size: { ...element.size, width: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Height">
            <input
              type="number"
              value={Math.round(element.size.height)}
              onChange={(e) =>
                onChange({ size: { ...element.size, height: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
        </div>
      </Section>

      {/* Shape */}
      <Section title="Shape">
        <Field label="Type">
          <Dropdown
            value={element.shape}
            onChange={(value) => onChange({ shape: value as NodeElement["shape"] })}
            options={[
              { value: "rectangle", label: "Rectangle" },
              { value: "rounded", label: "Rounded" },
              { value: "pill", label: "Pill" },
              { value: "circle", label: "Circle" },
              { value: "diamond", label: "Diamond" },
              { value: "cylinder", label: "Cylinder" },
            ]}
            size="sm"
          />
        </Field>
        <Field label="Corner Radius">
          <input
            type="number"
            value={element.style.borderRadius}
            onChange={(e) =>
              onChange({ style: { ...element.style, borderRadius: Number(e.target.value) } })
            }
            className="input"
            min={0}
          />
        </Field>
      </Section>

      {/* Fill */}
      <Section title="Fill">
        <div className="flex gap-2 items-center">
          <ColorInput
            value={element.style.fill}
            onChange={(fill) => onChange({ style: { ...element.style, fill } })}
          />
          <input
            type="text"
            value={element.style.fill}
            onChange={(e) => onChange({ style: { ...element.style, fill: e.target.value } })}
            className="input flex-1"
          />
        </div>
        <Field label="Opacity">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={element.style.fillOpacity}
            onChange={(e) =>
              onChange({ style: { ...element.style, fillOpacity: Number(e.target.value) } })
            }
            className="w-full"
          />
        </Field>
        {/* Presets */}
        <div className="flex flex-wrap gap-1 mt-2">
          {NODE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onChange({ style: { ...element.style, ...preset.style } as NodeElement["style"] })
              }
              className="w-6 h-6 rounded border-2 border-gray-400 hover:border-gray-600 transition-colors shadow-sm"
              style={{ backgroundColor: (preset.style as { fill?: string }).fill }}
              title={preset.name}
            />
          ))}
        </div>
      </Section>

      {/* Stroke */}
      <Section title="Stroke">
        <div className="flex gap-2 items-center">
          <ColorInput
            value={element.style.stroke}
            onChange={(stroke) => onChange({ style: { ...element.style, stroke } })}
          />
          <input
            type="text"
            value={element.style.stroke}
            onChange={(e) => onChange({ style: { ...element.style, stroke: e.target.value } })}
            className="input flex-1"
          />
        </div>
        <Field label="Width">
          <input
            type="number"
            value={element.style.strokeWidth}
            onChange={(e) =>
              onChange({ style: { ...element.style, strokeWidth: Number(e.target.value) } })
            }
            className="input"
            min={0}
            step={0.5}
          />
        </Field>
      </Section>

      {/* Title Text Style */}
      <Section title="Title Style">
        <Field label="Font">
          <Dropdown
            value={element.titleStyle.fontFamily}
            onChange={(value) =>
              onChange({ titleStyle: { ...element.titleStyle, fontFamily: value } })
            }
            options={FONT_OPTIONS}
            size="sm"
          />
        </Field>
        <Field label="Font Size">
          <input
            type="number"
            value={element.titleStyle.fontSize}
            onChange={(e) =>
              onChange({ titleStyle: { ...element.titleStyle, fontSize: Number(e.target.value) } })
            }
            className="input"
            min={8}
          />
        </Field>
        <Field label="Font Weight">
          <Dropdown
            value={element.titleStyle.fontWeight}
            onChange={(value) =>
              onChange({
                titleStyle: {
                  ...element.titleStyle,
                  fontWeight: value as "normal" | "medium" | "semibold" | "bold",
                },
              })
            }
            options={[
              { value: "normal", label: "Normal" },
              { value: "medium", label: "Medium" },
              { value: "semibold", label: "Semibold" },
              { value: "bold", label: "Bold" },
            ]}
            size="sm"
          />
        </Field>
        <Field label="Color">
          <div className="flex gap-2 items-center">
            <ColorInput
              value={element.titleStyle.color}
              onChange={(color) =>
                onChange({ titleStyle: { ...element.titleStyle, color } })
              }
            />
            <input
              type="text"
              value={element.titleStyle.color}
              onChange={(e) =>
                onChange({ titleStyle: { ...element.titleStyle, color: e.target.value } })
              }
              className="input flex-1"
            />
          </div>
        </Field>
      </Section>

      {/* Shadow */}
      <Section title="Shadow">
        <Field label="Enabled">
          <input
            type="checkbox"
            checked={!!element.style.shadow}
            onChange={(e) =>
              onChange({
                style: {
                  ...element.style,
                  shadow: e.target.checked
                    ? { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" }
                    : null,
                },
              })
            }
            className="w-4 h-4"
          />
        </Field>
        {element.style.shadow && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label="X">
                <input
                  type="number"
                  value={element.style.shadow.x}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        shadow: { ...element.style.shadow!, x: Number(e.target.value) },
                      },
                    })
                  }
                  className="input"
                />
              </Field>
              <Field label="Y">
                <input
                  type="number"
                  value={element.style.shadow.y}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        shadow: { ...element.style.shadow!, y: Number(e.target.value) },
                      },
                    })
                  }
                  className="input"
                />
              </Field>
            </div>
            <Field label="Blur">
              <input
                type="number"
                value={element.style.shadow.blur}
                onChange={(e) =>
                  onChange({
                    style: {
                      ...element.style,
                      shadow: { ...element.style.shadow!, blur: Number(e.target.value) },
                    },
                  })
                }
                className="input"
                min={0}
              />
            </Field>
          </>
        )}
      </Section>
    </div>
  );
}

// ============ TEXT INSPECTOR ============

interface TextInspectorProps {
  element: TextElement;
  onChange: (updates: Partial<TextElement>) => void;
}

function TextInspector({ element, onChange }: TextInspectorProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Content">
        <textarea
          value={element.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="input min-h-[80px] resize-none"
          rows={3}
        />
      </Section>

      <Section title="Transform">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X">
            <input
              type="number"
              value={Math.round(element.position.x)}
              onChange={(e) =>
                onChange({ position: { ...element.position, x: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Y">
            <input
              type="number"
              value={Math.round(element.position.y)}
              onChange={(e) =>
                onChange({ position: { ...element.position, y: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Text Style">
        <Field label="Font">
          <Dropdown
            value={element.style.fontFamily}
            onChange={(value) =>
              onChange({ style: { ...element.style, fontFamily: value } })
            }
            options={FONT_OPTIONS}
            size="sm"
          />
        </Field>
        <Field label="Font Size">
          <input
            type="number"
            value={element.style.fontSize}
            onChange={(e) =>
              onChange({ style: { ...element.style, fontSize: Number(e.target.value) } })
            }
            className="input"
            min={8}
          />
        </Field>
        <Field label="Font Weight">
          <Dropdown
            value={element.style.fontWeight}
            onChange={(value) =>
              onChange({
                style: {
                  ...element.style,
                  fontWeight: value as "normal" | "medium" | "semibold" | "bold",
                },
              })
            }
            options={[
              { value: "normal", label: "Normal" },
              { value: "medium", label: "Medium" },
              { value: "semibold", label: "Semibold" },
              { value: "bold", label: "Bold" },
            ]}
            size="sm"
          />
        </Field>
        <Field label="Color">
          <div className="flex gap-2 items-center">
            <ColorInput
              value={element.style.color}
              onChange={(color) => onChange({ style: { ...element.style, color } })}
            />
            <input
              type="text"
              value={element.style.color}
              onChange={(e) => onChange({ style: { ...element.style, color: e.target.value } })}
              className="input flex-1"
            />
          </div>
        </Field>
        <Field label="Align">
          <Dropdown
            value={element.style.textAlign}
            onChange={(value) =>
              onChange({
                style: {
                  ...element.style,
                  textAlign: value as "left" | "center" | "right",
                },
              })
            }
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
            size="sm"
          />
        </Field>
      </Section>

      <Section title="Background">
        <Field label="Color">
          <div className="flex gap-2 items-center">
            <ColorInput
              value={element.background || "transparent"}
              onChange={(color) => onChange({ background: color })}
            />
            <input
              type="text"
              value={element.background || ""}
              onChange={(e) => onChange({ background: e.target.value || undefined })}
              className="input flex-1"
              placeholder="none"
            />
          </div>
        </Field>
      </Section>
    </div>
  );
}

// ============ CONTAINER INSPECTOR ============

interface ContainerInspectorProps {
  element: ContainerElement;
  onChange: (updates: Partial<ContainerElement>) => void;
}

function ContainerInspector({ element, onChange }: ContainerInspectorProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Label">
        <Field label="Text">
          <input
            type="text"
            value={element.label?.text || ""}
            onChange={(e) =>
              onChange({
                label: element.label
                  ? { ...element.label, text: e.target.value }
                  : undefined,
              })
            }
            className="input"
          />
        </Field>
        <Field label="Position">
          <Dropdown
            value={element.label?.position || "bottom-center"}
            onChange={(value) =>
              onChange({
                label: element.label
                  ? {
                      ...element.label,
                      position: value as NonNullable<ContainerElement["label"]>["position"],
                    }
                  : undefined,
              })
            }
            options={[
              { value: "top-left", label: "Top Left" },
              { value: "top-center", label: "Top Center" },
              { value: "top-right", label: "Top Right" },
              { value: "bottom-left", label: "Bottom Left" },
              { value: "bottom-center", label: "Bottom Center" },
              { value: "bottom-right", label: "Bottom Right" },
            ]}
            size="sm"
          />
        </Field>
      </Section>

      <Section title="Transform">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X">
            <input
              type="number"
              value={Math.round(element.position.x)}
              onChange={(e) =>
                onChange({ position: { ...element.position, x: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Y">
            <input
              type="number"
              value={Math.round(element.position.y)}
              onChange={(e) =>
                onChange({ position: { ...element.position, y: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Width">
            <input
              type="number"
              value={Math.round(element.size.width)}
              onChange={(e) =>
                onChange({ size: { ...element.size, width: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
          <Field label="Height">
            <input
              type="number"
              value={Math.round(element.size.height)}
              onChange={(e) =>
                onChange({ size: { ...element.size, height: Number(e.target.value) } })
              }
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Fill">
        <div className="flex gap-2 items-center">
          <ColorInput
            value={element.style.fill}
            onChange={(fill) => onChange({ style: { ...element.style, fill } })}
          />
          <input
            type="text"
            value={element.style.fill}
            onChange={(e) => onChange({ style: { ...element.style, fill: e.target.value } })}
            className="input flex-1"
          />
        </div>
        <Field label="Opacity">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={element.style.fillOpacity}
            onChange={(e) =>
              onChange({ style: { ...element.style, fillOpacity: Number(e.target.value) } })
            }
            className="w-full"
          />
        </Field>
      </Section>

      <Section title="Stroke">
        <div className="flex gap-2 items-center">
          <ColorInput
            value={element.style.stroke}
            onChange={(stroke) => onChange({ style: { ...element.style, stroke } })}
          />
          <input
            type="text"
            value={element.style.stroke}
            onChange={(e) => onChange({ style: { ...element.style, stroke: e.target.value } })}
            className="input flex-1"
          />
        </div>
        <Field label="Width">
          <input
            type="number"
            value={element.style.strokeWidth}
            onChange={(e) =>
              onChange({ style: { ...element.style, strokeWidth: Number(e.target.value) } })
            }
            className="input"
            min={0}
            step={0.5}
          />
        </Field>
        <Field label="Dashed">
          <input
            type="text"
            value={element.style.strokeDasharray || ""}
            onChange={(e) =>
              onChange({ style: { ...element.style, strokeDasharray: e.target.value || undefined } })
            }
            className="input"
            placeholder="5,3"
          />
        </Field>
      </Section>
    </div>
  );
}

// ============ EDGE INSPECTOR ============

interface EdgeInspectorProps {
  element: EdgeElement;
  onChange: (updates: Partial<EdgeElement>) => void;
}

function EdgeInspector({ element, onChange }: EdgeInspectorProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Routing">
        <Field label="Type">
          <Dropdown
            value={element.routing}
            onChange={(value) =>
              onChange({ routing: value as "orthogonal" | "straight" | "curved" })
            }
            options={[
              { value: "orthogonal", label: "Orthogonal" },
              { value: "straight", label: "Straight" },
              { value: "curved", label: "Curved" },
            ]}
            size="sm"
          />
        </Field>
      </Section>

      <Section title="Stroke">
        <div className="flex gap-2 items-center">
          <ColorInput
            value={element.style.stroke}
            onChange={(stroke) => onChange({ style: { ...element.style, stroke } })}
          />
          <input
            type="text"
            value={element.style.stroke}
            onChange={(e) => onChange({ style: { ...element.style, stroke: e.target.value } })}
            className="input flex-1"
          />
        </div>
        <Field label="Width">
          <input
            type="number"
            value={element.style.strokeWidth}
            onChange={(e) =>
              onChange({ style: { ...element.style, strokeWidth: Number(e.target.value) } })
            }
            className="input"
            min={0.5}
            step={0.5}
          />
        </Field>
        <Field label="Dashed">
          <input
            type="text"
            value={element.style.strokeDasharray || ""}
            onChange={(e) =>
              onChange({ style: { ...element.style, strokeDasharray: e.target.value || undefined } })
            }
            className="input"
            placeholder="5,3"
          />
        </Field>
      </Section>

      <Section title="Arrows">
        <Field label="End Arrow">
          <input
            type="checkbox"
            checked={!!element.endArrow}
            onChange={(e) =>
              onChange({
                endArrow: e.target.checked ? { type: "filled", size: 8 } : null,
              })
            }
            className="w-4 h-4"
          />
        </Field>
        <Field label="Start Arrow">
          <input
            type="checkbox"
            checked={!!element.startArrow}
            onChange={(e) =>
              onChange({
                startArrow: e.target.checked ? { type: "filled", size: 8 } : null,
              })
            }
            className="w-4 h-4"
          />
        </Field>
      </Section>

      <Section title="Label">
        <Field label="Text">
          <input
            type="text"
            value={element.label?.text || ""}
            onChange={(e) =>
              onChange({
                label: e.target.value
                  ? {
                      text: e.target.value,
                      position: element.label?.position || 0.5,
                      style: element.label?.style || {
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 10,
                        fontWeight: "normal",
                        color: "#666666",
                        textAlign: "center",
                      },
                      background: "#ffffff",
                      padding: 4,
                    }
                  : undefined,
              })
            }
            className="input"
            placeholder="Add label..."
          />
        </Field>
      </Section>
    </div>
  );
}

// ============ SHARED COMPONENTS ============

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="w-8 h-8 rounded border-2 border-gray-400 p-0.5 cursor-pointer">
      <input
        type="color"
        value={value.startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full rounded-sm cursor-pointer border-0"
        style={{ padding: 0 }}
      />
    </div>
  );
}

interface AlignButtonProps {
  onClick: () => void;
  disabled?: boolean;
  tooltip: string;
  wide?: boolean;
  children: React.ReactNode;
}

function AlignButton({ onClick, disabled, tooltip, wide, children }: AlignButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        flex items-center justify-center gap-1 py-2 rounded-lg
        transition-all duration-100
        ${wide ? "px-3" : "px-2"}
        ${disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
        }
      `}
    >
      {children}
    </button>
  );
}

// ============ CANVAS INSPECTOR ============

interface CanvasInspectorProps {
  canvas: {
    width: number;
    height: number;
    background: string;
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
  };
  diagramName: string;
  onChange: (updates: Partial<CanvasInspectorProps["canvas"]>) => void;
  onNameChange: (name: string) => void;
}

function CanvasInspector({ canvas, diagramName, onChange, onNameChange }: CanvasInspectorProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Project">
        <Field label="Name">
          <input
            type="text"
            value={diagramName}
            onChange={(e) => onNameChange(e.target.value)}
            className="input"
            placeholder="Untitled Diagram"
          />
        </Field>
      </Section>

      <Section title="Canvas">
        <Field label="Background">
          <div className="flex gap-2 items-center">
            <ColorInput value={canvas.background} onChange={(bg) => onChange({ background: bg })} />
            <input
              type="text"
              value={canvas.background}
              onChange={(e) => onChange({ background: e.target.value })}
              className="input flex-1"
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width">
            <input
              type="number"
              value={canvas.width}
              onChange={(e) => onChange({ width: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Height">
            <input
              type="number"
              value={canvas.height}
              onChange={(e) => onChange({ height: Number(e.target.value) })}
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Grid">
        <Field label="Grid Size">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={canvas.gridSize}
              onChange={(e) => onChange({ gridSize: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-10 text-right">{canvas.gridSize}px</span>
          </div>
        </Field>
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-500">Show Grid</span>
          <button
            onClick={() => onChange({ showGrid: !canvas.showGrid })}
            className={`w-10 h-5 rounded-full transition-colors duration-200 ${
              canvas.showGrid ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                canvas.showGrid ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-500">Snap to Grid</span>
          <button
            onClick={() => onChange({ snapToGrid: !canvas.snapToGrid })}
            className={`w-10 h-5 rounded-full transition-colors duration-200 ${
              canvas.snapToGrid ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                canvas.snapToGrid ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </Section>

      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <p>Click on elements in the canvas to edit their properties here.</p>
        </div>
      </div>
    </div>
  );
}

// ============ EXPORT PANEL ============

import type { Diagram } from "@/lib/schema/types";

interface ExportPanelProps {
  diagram: Diagram;
  onSave: () => void;
}

function ExportPanel({ diagram, onSave }: ExportPanelProps) {
  const handleExportPNG = async () => {
    const { toPng } = await import("html-to-image");
    const canvas = document.querySelector("#diagram-canvas") as HTMLElement;
    if (canvas) {
      const dataUrl = await toPng(canvas, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${diagram.name || "diagram"}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleExportSVG = async () => {
    const { toSvg } = await import("html-to-image");
    const canvas = document.querySelector("#diagram-canvas") as HTMLElement;
    if (canvas) {
      const dataUrl = await toSvg(canvas);
      const link = document.createElement("a");
      link.download = `${diagram.name || "diagram"}.svg`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${diagram.name || "diagram"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <Section title="Quick Export">
        <div className="space-y-2">
          <button
            onClick={handleExportPNG}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileImage size={18} className="text-gray-400" />
            <div className="flex-1 text-left">
              <p className="font-medium">Export PNG</p>
              <p className="text-xs text-gray-400">High quality image</p>
            </div>
          </button>
          <button
            onClick={handleExportSVG}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileCode size={18} className="text-gray-400" />
            <div className="flex-1 text-left">
              <p className="font-medium">Export SVG</p>
              <p className="text-xs text-gray-400">Scalable vector</p>
            </div>
          </button>
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileText size={18} className="text-gray-400" />
            <div className="flex-1 text-left">
              <p className="font-medium">Export JSON</p>
              <p className="text-xs text-gray-400">Diagram data</p>
            </div>
          </button>
        </div>
      </Section>

      <Section title="Save">
        <button
          onClick={onSave}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          <Grid3X3 size={16} />
          Save to Browser
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Projects are auto-saved every 30 seconds
        </p>
      </Section>
    </div>
  );
}
