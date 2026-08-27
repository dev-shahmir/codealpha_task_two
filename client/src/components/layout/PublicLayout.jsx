import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { OrganizationSchema, WebSiteSchema } from '../seo/StructuredData';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationSchema />
      <WebSiteSchema />
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
