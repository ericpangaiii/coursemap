import { APP_NAME } from "@/lib/config";

const PageHeader = ({ title }) => {
  return (
    <div className="flex flex-col mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
};

export default PageHeader; 