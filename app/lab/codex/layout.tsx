import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function ToolkitLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
}
