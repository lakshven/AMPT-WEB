import React from "react";

export interface FileLinkProps {
  href: string;
  assetId: string | number | undefined;
  type: string;
  label: string;
  className?: string; // optional, supports custom styling
}

const FileLink: React.FC<FileLinkProps> = ({
  href,
  label,
  className,
}) => {

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "text-blue-600 hover:underline"}
    >
      {label}
    </a>
  );
};

export default FileLink;
