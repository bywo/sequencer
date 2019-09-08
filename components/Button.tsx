export default function Button({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-block",
        background: "#48E884",
        color: "white",
        padding: "20px 40px",
        borderRadius: "100px"
      }}
    >
      {children}
    </div>
  );
}
