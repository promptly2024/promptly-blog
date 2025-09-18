import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <DashboardLayout>{children}</DashboardLayout>
        </div>
    );
}
