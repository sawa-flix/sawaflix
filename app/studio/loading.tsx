import BrandLoader from '../../components/BrandLoader';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0E14]">
      <BrandLoader label="Loading Studio" />
    </div>
  );
}
