import * as React from "react";
interface EmailEpisodeResourceTemplateProps {
  link: string;
}

export const EmailEpisodeResourceTemplate: React.FC<
  Readonly<EmailEpisodeResourceTemplateProps>
> = ({ link }) => (
  <div
    style={{
      fontFamily: "sans-serif",
      padding: "20px",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <h1 style={{ color: "#333", fontSize: "24px", marginBottom: "20px" }}>
      Hi there,
    </h1>
    <p
      style={{
        color: "#555",
        fontSize: "16px",
        lineHeight: "1.6",
        marginBottom: "20px",
      }}
    >
      Here is the link to the readings:{" "}
      <a href={link} style={{ color: "#007bff", textDecoration: "underline" }}>
        {link}
      </a>
    </p>
    <p
      style={{
        color: "#555",
        fontSize: "16px",
        lineHeight: "1.6",
        marginBottom: "0",
      }}
    >
      Best regards,
      <br />
      Lantern and Pine
    </p>
  </div>
);
