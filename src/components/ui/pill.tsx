import React from "react";
import Icon from "@hackclub/icons";

export default function Pill({
  msg,
  color = "gray",
  classes = "",
  glyph,
  glyphImage,
  glyphSize = 24,
  glyphStyles = {},
  percentage,
  id = "",
}: {
  msg: string;
  color?: "red" | "yellow" | "green" | "blue" | "purple" | "gray";
  classes?: string;
  glyph?: any;
  glyphImage?: React.ReactNode;
  glyphSize?: number;
  glyphStyles?: React.CSSProperties;
  percentage?: number;
  id?: string;
}) {
  const colorClasses = {
    red: "text-red-600 bg-red-50 border-red-500/10",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-500/10",
    green: "text-green-600 bg-green-50 border-green-500/10",
    blue: "text-blue-600 bg-blue-50 border-blue-500/10",
    purple: "text-purple-600 bg-purple-50 border-purple-500/10",
    gray: "text-gray-600 bg-gray-50 border-gray-500/10",
  };

  const progressBarStyle = percentage
    ? {
        background: `linear-gradient(to right, #dee9f7, ${percentage}%, transparent ${percentage}%)`,
      }
    : {};

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none ${colorClasses[color]} ${classes}`}
      style={{ verticalAlign: "middle", ...progressBarStyle }}
    >
      {glyphImage}
      {glyph && (
        <Icon
          glyph={glyph}
          size={glyphSize}
          style={{
            ...glyphStyles,
            display: "inline-block",
            verticalAlign: "middle",
          }}
        />
      )}
      <span className="inline-block py-1">{msg}</span>
    </span>
  );
}
