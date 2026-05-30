import "./global.css";
import ClientToaster from "../components/ClientToaster";

export const metadata = {
  title: "NexusOps X",
  description: "AI Infrastructure Command Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}
        {<ClientToaster />}
      </body>
    </html>
  );
}