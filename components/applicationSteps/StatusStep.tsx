import * as React from "react";

import styled from "styled-components";

import Router from "next/router";

import getProfileStage from "../../lib/getProfileStage";

import { Flex, Column, Button } from "../../styles";

import Check from "../../assets/check.svg";

type Props = {
  profile: Profile;
};

const getStatusLabel = (status: string) => {
  if (!status) {
    return "Unverified";
  }
  if (status === "profileSubmitted") return "Profile Submitted";
  if (status === "applicationSubmitted") return "Application Submitted";
  if (status === "checkedIn") return "Checked In";

  return status[0].toUpperCase() + status.substring(1, status.length);
};

const navigateTo = (step: string): void => {
  Router.push(`/dashboard/${step}`);
};

const StatusStep: React.FunctionComponent<Props> = props => {
  const { profile } = props;
  const { status } = profile;

  const statusLabel = getStatusLabel(status);

  return (
    <Flex direction="column">
      <h1>Hey there!</h1>

      <Status align="center" justify="space-between">
        <Flex direction="row" align="center">
          <img src={Check} alt="Check" />
          <h2>Status</h2>
        </Flex>

        <Label>{statusLabel}</Label>
      </Status>

      <Flex justify="space-between" tabletVertical>
        <Column flexBasis={63}>
          <h2>Next Steps</h2>
          <Steps>
            <Step>
              <h3>1. Set up your profile</h3>
              <p>Set up your hacker profile so we can learn more about you.</p>

              {getProfileStage(profile) <= 1 && (
                <StepButton onClick={() => navigateTo("profile")}>
                  Set Up Profile
                </StepButton>
              )}
            </Step>
            <Step>
              <h3>2. Fill out an application</h3>
              <p>
                Answer a few questions to show why you want to be at HackSC
                2020!
              </p>

              {getProfileStage(profile) === 2 && (
                <StepButton onClick={() => navigateTo("application")}>
                  Fill out application
                </StepButton>
              )}
            </Step>
            <Step>
              <h3>3. View Results</h3>
              <p>Come back on December 1st, 2019 to see your results.</p>
              {getProfileStage(profile) === 3 && (
                <StepButton onClick={() => navigateTo("results")}>
                  View Results
                </StepButton>
              )}
            </Step>
          </Steps>
        </Column>

        <DatesColumn flexBasis={35}>
          <h2>Major Dates</h2>

          <Dates>
            <Date>
              <h3>Applications Open</h3>
              <p>November 1st, 2019</p>
            </Date>

            <Date>
              <h3>Applications Close</h3>
              <p>November 22nd, 2019</p>
            </Date>

            <Date>
              <h3>HackSC 2020</h3>
              <p>January 31, 2020</p>
            </Date>
          </Dates>
        </DatesColumn>
      </Flex>
    </Flex>
  );
};

const Status = styled(Flex)`
  padding: 48px;
  margin: 16px 0 32px;
  background: #ffffff;
  border-radius: 4px;

  h2 {
    padding: 0;
    margin-left: 16px;
  }

  ${({ theme }) =>
    theme.media.tablet`
      padding: 32px;
    `}
`;

const DatesColumn = styled(Column)`
  ${({ theme }) =>
    theme.media.tablet`
      margin-top: 32px;
    `}
`;

const Label = styled.p`
  margin: 0;
  padding: 0;
  font-weight: 600;
`;

const Steps = styled.div`
  margin-top: 12px;
`;

const Step = styled.div`
  padding: 24px 36px;
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepButton = styled(Button)`
  margin-top: 24px;
`;

const Dates = styled.div`
  padding: 24px 36px;
  margin: 16px 0 32px;
  background: #ffffff;
  border-radius: 4px;
`;

const Date = styled.div`
  margin-top: 36px;

  :first-child {
    margin-top: 0;
  }

  h3 {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.peach};
    padding-bottom: 4px;
  }
`;

export default StatusStep;
