import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/firebase/firestore";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const title = project?.title ?? "Project";
  const description = project?.shortDescription ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#faf9f7",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "64px",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#d97706",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Portfolio
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1c1917",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              fontSize: 24,
              color: "#57534e",
              marginTop: 24,
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
