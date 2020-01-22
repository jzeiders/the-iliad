import React from "react";
import * as Sentry from "@sentry/browser";

import {
  handleLoginRedirect,
  getProfile,
  handleAdminRedirect
} from "../lib/authenticate";

import Head from "../components/Head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { Background, Container } from "../styles";

import Steps from "../components/LiveDashboard";

import { generatePosts } from "../lib/referrerCode";

const Dashboard = ({ profile, socialPosts }) => {
  return (
    <>
      <Head title="HackSC Odyssey - Dashboard" />
      <Navbar loggedIn activePage="dashboard" />
      <Background>
        {profile && (
          <Container>
            {profile && <Steps profile={profile} socialPosts={socialPosts} />}
          </Container>
        )}
      </Background>
      <Footer />
    </>
  );
};

Dashboard.getInitialProps = async ({ req }) => {
  const profile = await getProfile(req);

  // Null profile means user is not logged in
  if (!profile) {
    handleLoginRedirect(req);
  } else if (profile.role == "admin") {
    handleAdminRedirect(req);
  }

  if (typeof window !== "undefined") {
    Sentry.configureScope(function(scope) {
      scope.setExtra("profile", profile);
    });
  }

  const socialPosts = generatePosts(profile);

  return {
    profile,
    socialPosts
  };
};

export default Dashboard;
