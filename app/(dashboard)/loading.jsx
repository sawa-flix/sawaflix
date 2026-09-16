import DashboardWrapper from "../../components/Dashboard/DashboardWrapper";
import BrandLoader from "../../components/BrandLoader";

export default function Loading() {
  return (
    <DashboardWrapper>
      <BrandLoader label="Entering Sawaflix" className="min-h-[60vh]" />
    </DashboardWrapper>
  );
}
