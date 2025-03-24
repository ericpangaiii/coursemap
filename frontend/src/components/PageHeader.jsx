import { APP_NAME } from "@/lib/config";

const PageHeader = ({ title }) => {
  return (
    <div className="flex flex-col mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{APP_NAME}</p>
    </div>
  );
};

export default PageHeader; 