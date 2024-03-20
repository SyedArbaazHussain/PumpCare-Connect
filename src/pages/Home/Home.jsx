import HomeNavbar from "../../components/Navbars/HomeNavbar";

const Home = () => {
  return (
    <>
      <HomeNavbar />
      <div className="wr">
        <h1 className="phomeh1">PumpCare&ensp;Connect</h1>
        <div className="wr2">
          <div className="phome">
            <ul>
              <li className="hlist">
                PumpCare Connect is a user-friendly platform designed to
                streamline water management in your panchayat.
              </li>
              <li className="hlist">
                {" "}
                We offer a centralized hub for accessing crucial information,
                facilitating communication, and resolving water supply issues
                effectively
              </li>
              <li className="hlist">
                Join PumpCare Connect and experience the benefits of transparent
                and efficient water management for your community.
              </li>
            </ul>
          </div>
        </div>
        <div className="homebtnswrapper">
          <div className="homebtns">
            <button
              className="btnhome"
              onClick={() => (window.location.href = "/LoginSelect")}
            >
              Go to Login
            </button>
            <button
              className="btnhome"
              onClick={() => (window.location.href = "/SignupSelect")}
            >
              Go to Signup
            </button>
            <button
              className="btnhome"
              onClick={() => (window.location.href = "/complaint")}
            >
              Complaints
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
