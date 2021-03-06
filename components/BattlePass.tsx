import React, { useMemo } from "react";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import { BPLock, BPOpenLock, Flex, Column } from "../styles";

import RaffleTicketCount from "./RaffleTicketCount";

type Props = {
  profile: Profile;
};

type ItemProps = {
  premium?: boolean;
  prizeName?: string;
  unlocked?: boolean;
  currentTier: boolean;
  minimum: number;
  projSubmitted: boolean;
  userPoints?: number;
  itemTier?: number;
};

const bpItem: React.SFC<ItemProps> = ({
  premium,
  prizeName,
  unlocked,
  currentTier,
  userPoints = 0,
  itemTier = 0,
  minimum,
  projSubmitted
}) => {
  let locked = !unlocked;
  let showOverlay = false;

  if (!projSubmitted && premium) {
    locked = true;
  }

  if (!unlocked) {
    showOverlay = true;
  }

  return (
    <TableTD
      bgColor={premium ? "#E3BF5F" : "#7FBDE9"}
      borderColor={currentTier ? "#FFFFFF" : "transparent"}
      key={itemTier + prizeName + currentTier + userPoints + premium}
    >
      <LockImage>{locked ? <BPLock fill="#FFFFFF" /> : null}</LockImage>
      <MarginDiv>
        <PrizeItem>{prizeName}</PrizeItem>
        <PrizeMinPoints>
          <b>Min Points:</b> {minimum}
        </PrizeMinPoints>
      </MarginDiv>

      {showOverlay && <LockedOverlay />}
    </TableTD>
  );
};

const useBattlepassItems = (bp: Battlepass, userPoints: number) => {
  return useMemo(() => {
    const premiumItems = bp.filter(item => {
      return item.isPremium;
    });

    const basicItems = bp.filter(item => {
      return !item.isPremium;
    });

    if (premiumItems && premiumItems.length > 0) {
      premiumItems.reduce(
        (total, item, idx) => {
          let sum = idx === 0 ? 0 : total.total + item.pointValue;
          item.unlocked = userPoints >= sum;
          item.minimum = sum;
          return { total: sum };
        },
        { total: 0 }
      );
    }

    let currentTier = 0;
    let pointsTillNextTier = 0;

    if (basicItems && basicItems.length > 0) {
      basicItems.reduce(
        (total, item, idx) => {
          let sum = idx === 0 ? 0 : total.total + item.pointValue;
          item.unlocked = userPoints >= sum;
          item.minimum = sum;
          return { total: sum };
        },
        { total: 0 }
      );

      // Get current tier
      let i = 0;
      for (i = 0; i < basicItems.length; i++) {
        const item = basicItems[i];

        if (userPoints < item.minimum) {
          break;
        }
      }

      currentTier = i - 1;

      // Get points till next tier
      if (currentTier === basicItems.length - 1) {
        pointsTillNextTier = 0;
      } else {
        pointsTillNextTier = basicItems[currentTier + 1].minimum - userPoints;
      }
    }

    return {
      basicItems,
      premiumItems,
      currentTier,
      pointsTillNextTier
    };
  }, [bp, userPoints]);
};
const BattlePass = ({
  bp,
  userPoints,
  projSubmitted
}: {
  bp: Battlepass;
  userPoints: number;
  projSubmitted: boolean;
}) => {
  const {
    basicItems,
    premiumItems,
    currentTier,
    pointsTillNextTier
  } = useBattlepassItems(bp, userPoints || 0);

  const bptable = (
    <BPTable>
      <tbody>
        <RoundedTR>
          <TierLabel>Standard</TierLabel>
          {basicItems
            ? basicItems.map((item, index) => {
                return item
                  ? bpItem({
                      userPoints: userPoints,
                      itemTier: index,
                      premium: false,
                      projSubmitted,
                      ...item,
                      currentTier: index === currentTier
                    })
                  : "";
              })
            : ""}
        </RoundedTR>
        <RoundedTR>
          <TierLabel>
            Premium <br /> {projSubmitted ? "Unlocked" : "Locked"}
          </TierLabel>
          {premiumItems
            ? premiumItems.map((item, index) => {
                return item
                  ? bpItem({
                      userPoints: userPoints,
                      itemTier: index,
                      premium: true,
                      projSubmitted,
                      ...item,
                      currentTier: index === currentTier
                    })
                  : "";
              })
            : ""}
        </RoundedTR>
      </tbody>
    </BPTable>
  );

  return (
    <>
      <Header>BattlePass</Header>

      <Info>
        <Flex
          direction="row"
          justify="space-between"
          align="center"
          tabletVertical
        >
          <Column flexGrow={1}>
            <Flex direction="row" align="center">
              <Subheader>Tier</Subheader>
              <BigNumber>{currentTier + 1}</BigNumber>
            </Flex>
          </Column>

          <Column flexGrow={1}>
            <Flex direction="row" align="center">
              <Subheader>Points</Subheader>
              <BigNumber>{userPoints || 0}</BigNumber>
            </Flex>
          </Column>

          <Column flexBasis={40}>
            <Flex direction="row" align="center">
              <Subheader>Points till next tier</Subheader>
              <BigNumber>{pointsTillNextTier}</BigNumber>
            </Flex>
          </Column>
        </Flex>
      </Info>

      <OverflowHidden>
        <Scrollable>{bp ? bptable : ""}</Scrollable>
        <BattlePassFade />
      </OverflowHidden>

      <RaffleTicketCount />
    </>
  );
};

const OverflowHidden = styled.div`
  overflow: hidden;
  position: relative;
`;

const BattlePassFade = styled.div`
  content: "";
  position: absolute;
  z-index: 999;
  right: -2rem;
  top: 0;
  pointer-events: none;
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 0),
    #f6f6f6 70%
  );
  width: 8rem;
  height: 100%;
`;

const LockImage = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
`;

const Header = styled.h2`
  margin-left: 5px;
`;

const Subheader = styled.h3`
  padding: 0;
  margin-right: 15px;
  font-size: 18px;
  text-transform: uppercase;
`;

const BigNumber = styled.p`
  font-size: 32px;
  ${({ theme }) => theme.media.tablet`
    padding: 20px 0;
  `}
`;

const Info = styled.div`
  padding: 24px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #cfcfcf;
`;

const MarginDiv = styled.div`
  text-align: center;
  margin: auto;
`;

const PrizeItem = styled.h4`
  font-size: 18px;
  margin: auto;
`;

const PrizeMinPoints = styled.p`
  margin-top: 12px;
`;

const BPTable = styled.table`
  border-collapse: collapse;
  width: 110%;
  margin: 18px 0;
`;

const Scrollable = styled.div`
  overflow-x: scroll;
`;

const RoundedTR = styled.tr`
  display: -webkit-inline-box;
  width: max-content;
  padding-right: 4rem;
`;

const TableTD = styled.td<{ bgColor?: string; borderColor?: string }>`
  display: -webkit-inline-box;
  position: relative;
  height: 180px;
  background-color: ${({ bgColor = "white" }) => bgColor};
  width: 140px;
  padding: 10px;
  margin: 5px;
  vertical-align: middle;
  border-radius: 6px;
  overflow: hidden;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
`;

const TierLabel = styled.td`
  vertical-align: middle;
  height: 180px;
  padding-right: 12px;
  font-weight: 600;
`;

export default BattlePass;
