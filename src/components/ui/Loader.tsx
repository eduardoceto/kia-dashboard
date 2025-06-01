import ContentLoader from 'react-content-loader';

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[60vh] w-full">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-8">
        {/* Greeting Card (spans 3 columns) */}
        <div className="col-span-1 md:col-span-3">
          <ContentLoader
            speed={1}
            width="100%"
            height={80}
            viewBox="0 0 1100 80"
            backgroundColor="#05141F"
            foregroundColor="#697279"
            style={{ width: '100%', height: 80, borderRadius: 16 }}
          >
            <rect x="0" y="0" rx="16" ry="16" width="1100" height="80" />
            <rect x="32" y="24" rx="6" ry="6" width="400" height="24" />
          </ContentLoader>
        </div>
        {/* Progress Card (spans 3 columns) */}
        <div className="col-span-1 md:col-span-3">
          <ContentLoader
            speed={1}
            width="100%"
            height={180}
            viewBox="0 0 1100 180"
            backgroundColor="#f2f2f2"
            foregroundColor="#697279"
            style={{ width: '100%', height: 180, borderRadius: 16 }}
          >
            <rect x="0" y="0" rx="16" ry="16" width="1100" height="180" />
            <rect x="40" y="32" rx="6" ry="6" width="350" height="32" />
            <rect x="40" y="80" rx="8" ry="8" width="200" height="48" />
            <rect x="40" y="140" rx="8" ry="8" width="800" height="16" />
          </ContentLoader>
        </div>
        {/* Row of 3 cards */}
        <ContentLoader
          speed={1}
          width="100%"
          height={220}
          viewBox="0 0 350 220"
          backgroundColor="#f2f2f2"
          foregroundColor="#697279"
          style={{ width: '100%', height: 220, borderRadius: 16 }}
        >
          <rect x="0" y="0" rx="16" ry="16" width="350" height="220" />
          <rect x="24" y="24" rx="6" ry="6" width="180" height="24" />
          <rect x="24" y="64" rx="4" ry="4" width="120" height="120" />
          <rect x="24" y="200" rx="8" ry="8" width="100" height="16" />
        </ContentLoader>
        <ContentLoader
          speed={1}
          width="100%"
          height={220}
          viewBox="0 0 350 220"
          backgroundColor="#f2f2f2"
          foregroundColor="#697279"
          style={{ width: '100%', height: 220, borderRadius: 16 }}
        >
          <rect x="0" y="0" rx="16" ry="16" width="350" height="220" />
          <rect x="24" y="24" rx="6" ry="6" width="180" height="24" />
          <rect x="24" y="64" rx="4" ry="4" width="80" height="40" />
          <rect x="24" y="120" rx="4" ry="4" width="200" height="32" />
          <rect x="24" y="170" rx="8" ry="8" width="100" height="16" />
        </ContentLoader>
        <ContentLoader
          speed={1}
          width="100%"
          height={220}
          viewBox="0 0 350 220"
          backgroundColor="#f2f2f2"
          foregroundColor="#697279"
          style={{ width: '100%', height: 220, borderRadius: 16 }}
        >
          <rect x="0" y="0" rx="16" ry="16" width="350" height="220" />
          <rect x="24" y="24" rx="6" ry="6" width="180" height="24" />
          <rect x="24" y="64" rx="4" ry="4" width="280" height="120" />
          <rect x="24" y="200" rx="8" ry="8" width="100" height="16" />
        </ContentLoader>
        {/* Table (spans 2 columns) */}
        <div className="col-span-1 md:col-span-2">
          <ContentLoader
            speed={1}
            width="100%"
            height={260}
            viewBox="0 0 750 260"
            backgroundColor="#f2f2f2"
            foregroundColor="#697279"
            style={{ width: '100%', height: 260, borderRadius: 16 }}
          >
            <rect x="0" y="0" rx="16" ry="16" width="750" height="260" />
            <rect x="24" y="24" rx="6" ry="6" width="300" height="24" />
            {/* Table header */}
            <rect x="24" y="64" rx="4" ry="4" width="700" height="20" />
            {/* Table rows */}
            <rect x="24" y="94" rx="4" ry="4" width="700" height="20" />
            <rect x="24" y="124" rx="4" ry="4" width="700" height="20" />
            <rect x="24" y="154" rx="4" ry="4" width="700" height="20" />
            <rect x="24" y="184" rx="4" ry="4" width="700" height="20" />
          </ContentLoader>
        </div>
        {/* Bar chart card */}
        <ContentLoader
          speed={1}
          width="100%"
          height={260}
          viewBox="0 0 350 260"
          backgroundColor="#f2f2f2"
          foregroundColor="#697279"
          style={{ width: '100%', height: 260, borderRadius: 16 }}
        >
          <rect x="0" y="0" rx="16" ry="16" width="350" height="260" />
          <rect x="24" y="24" rx="6" ry="6" width="180" height="24" />
          <rect x="24" y="64" rx="4" ry="4" width="280" height="160" />
        </ContentLoader>
        {/* Last row: 2 cards */}
        <ContentLoader
          speed={1}
          width="100%"
          height={180}
          viewBox="0 0 350 180"
          backgroundColor="#f2f2f2"
          foregroundColor="#697279"
          style={{ width: '100%', height: 180, borderRadius: 16 }}
        >
          <rect x="0" y="0" rx="16" ry="16" width="350" height="180" />
          <rect x="24" y="24" rx="6" ry="6" width="180" height="24" />
          <rect x="24" y="64" rx="4" ry="4" width="80" height="48" />
          <rect x="24" y="120" rx="8" ry="8" width="100" height="24" />
        </ContentLoader>
        <ContentLoader
          speed={1}
          width="100%"
          height={180}
          viewBox="0 0 350 180"
          backgroundColor="#f2f2f2"
          foregroundColor="#697279"
          style={{ width: '100%', height: 180, borderRadius: 16 }}
        >
          <rect x="0" y="0" rx="16" ry="16" width="350" height="180" />
          <rect x="24" y="24" rx="6" ry="6" width="180" height="24" />
          <rect x="24" y="64" rx="4" ry="4" width="120" height="48" />
          <rect x="24" y="120" rx="8" ry="8" width="100" height="24" />
        </ContentLoader>
      </div>
    </div>
  );
} 