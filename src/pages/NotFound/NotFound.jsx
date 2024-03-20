import HomeNavbar from "../../components/Navbars/HomeNavbar";

const NotFound = () => {
  return (
    <>
      <HomeNavbar />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-center mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 text-center">
          Oops! The page you are looking for does not exist.
        </p>
      </div>
    </>
  );
};

export default NotFound;
