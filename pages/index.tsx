import OverviewPage from "src/ui/overview/OverviewPage";
import React, { ReactElement } from "react";
import PageView from "src/ui/app/PageView";
import { ProposalsJson } from "@elementfi/elf-council-proposals";
import { PROPOSALS_JSON_URL } from "src/elf-council-proposals";
import {
  getRecentDelegators,
  WhitelistData,
} from "src/ui/overview/getRecentDelegators";

interface HomeProps {
  proposalsJson: ProposalsJson;
  whitelist: string[];
  whitelistData: WhitelistData[];
  blockNumbers: number[];
}
export default function Home({
  proposalsJson,
  whitelist,
  whitelistData,
  blockNumbers,
}: HomeProps): ReactElement {
  console.log(whitelist);
  console.log(whitelistData);

  const min = Math.min(...blockNumbers);
  const max = Math.max(...blockNumbers);
  console.log("first block number: ", min);
  console.log("Last block number: ", max);
  console.log("total time since epoch (gov launch) ", max - min);
  return (
    <PageView childrenContainerClassName="flex justify-center">
      <OverviewPage
        proposalsJson={proposalsJson}
        recentDelegators={whitelist}
      />
    </PageView>
  );
}

export async function getStaticProps(): Promise<{
  props: HomeProps;
  revalidate: number;
}> {
  const { whitelist, whitelistData, blockNumbers } =
    await getRecentDelegators();
  const res = await fetch(PROPOSALS_JSON_URL);
  const proposalsJson = await res.json();

  return {
    props: { proposalsJson, whitelist, whitelistData, blockNumbers },
    revalidate: 5, // seconds,
  };
}
