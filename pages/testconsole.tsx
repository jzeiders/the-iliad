import React, { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import Cookie from "js-cookie";
import { parseCookies } from "../lib/parseCookies";
import { getUser } from "../lib/authenticate";

// Load AuthForm as an AMP page
export const config = { amp: "hybrid" };

const TestConsole = initialObject => {
  const { user } = initialObject;
  const [requestBody, setRequestBody] = useState("{}");
  return (
    <div>
      <textarea
        onChange={e => {
          const target = event.target as HTMLTextAreaElement;
          setRequestBody(target.value);
        }}
      />
      <button
        onClick={async () => {
          const jsonBody = JSON.parse(requestBody);
          console.log(jsonBody);
          const response = await fetch("http://localhost:3000/api/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody)
          });
          console.log(response);
        }}
      >
        Click to send a request!
      </button>
    </div>
  );
};

TestConsole.getInitialProps = async ({ req }) => {
  const user = await getUser(req);
  return {
    user: user
  };
};

export default TestConsole;
