"use client";

import { useDiagramStore } from "@/lib/store/diagramStore";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  NodeElement,
  TextElement,
  ContainerElement,
  EdgeElement,
  NODE_PRESETS,
} from "@/lib/schema/types";

export function Inspector() {
  const { diagram, selectedIds, updateElement } = useDiagramStore();

  // Get selected element
  const selectedElement =
    selectedIds.length === 1
      ? diagram.elements.find((e) => e.id === selectedIds[0])
      : null;

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm text-gray-400 text-center">
            Select an element to edit its properties
          </p>
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

      <div key={selectedElement.id} className="flex-1 overflow-y-auto animate-fade-in">
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
              className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 transition-colors"
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
    <input
      type="color"
      value={value.startsWith("#") ? value : "#000000"}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
    />
  );
}
