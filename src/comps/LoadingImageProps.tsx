import React from "react";

type LoadingImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

export function LoadingImage(props: LoadingImageProps) {
  const { src, alt = "preview", className } = props;
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
    "loading"
  );

  React.useEffect(() => {
    setStatus("loading");
  }, [src]);

  return (
    <div className="relative w-full min-h-[10px] bg-black rounded-xl overflow-hidden">
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm">Loading image...</div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-300">
          Failed to load image
        </div>
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={[
          "block w-full h-auto transition-opacity duration-200",
          status === "loaded" ? "opacity-100" : "opacity-0",
          className ?? "",
        ].join(" ")}
      />
    </div>
  );
}