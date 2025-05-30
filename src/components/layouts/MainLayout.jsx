import NavDropDown from '../NavDropDown';

function MainLayout({ children }) {
  return (
    <>
      <NavDropDown />
      <main className="p-4">{children}</main>
    </>
  );
}

export default MainLayout;