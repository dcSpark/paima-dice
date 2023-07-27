import type { ParserRecord } from 'paima-sdk/paima-utils-backend';
import { PaimaParser } from 'paima-sdk/paima-utils-backend';
import type {
  CardPackBuyInput,
  ClosedLobbyInput,
  CreatedLobbyInput,
  JoinedLobbyInput,
  NftMintInput,
  ParsedSubmittedInput,
  PracticeMovesInput,
  SubmittedMovesInput,
  UserStats,
  ZombieRound,
} from './types';
import { SAFE_NUMBER } from '@dice/utils';

const myGrammar = `
nftMint             = nftmint|address|tokenId
cardPackBuy         = cardpack|address|tokenId
createdLobby        = c|creatorNftId|creatorCommitments|numOfRounds|roundLength|playTimePerPlayer|isHidden?|isPractice?
joinedLobby         = j|nftId|*lobbyID|commitments
closedLobby         = cs|*lobbyID
submittedMoves      = s|nftId|*lobbyID|matchWithinLobby|roundWithinMatch|move
practiceMoves       = p|*lobbyID|matchWithinLobby|roundWithinMatch
zombieScheduledData = z|*lobbyID
userScheduledData   = u|*user|result
`;

const nftMint: ParserRecord<NftMintInput> = {
  address: PaimaParser.WalletAddress(),
  tokenId: PaimaParser.NumberParser(),
};
const cardPackBuy: ParserRecord<CardPackBuyInput> = {
  address: PaimaParser.WalletAddress(),
  tokenId: PaimaParser.NumberParser(),
};
const createdLobby: ParserRecord<CreatedLobbyInput> = {
  creatorNftId: PaimaParser.NumberParser(),
  creatorCommitments: PaimaParser.NCharsParser(0, 1000),
  numOfRounds: PaimaParser.NumberParser(0, 1000),
  roundLength: PaimaParser.DefaultRoundLength(),
  playTimePerPlayer: PaimaParser.NumberParser(1, 10000),
  isHidden: PaimaParser.TrueFalseParser(false),
  isPractice: PaimaParser.TrueFalseParser(false),
};
const joinedLobby: ParserRecord<JoinedLobbyInput> = {
  nftId: PaimaParser.NumberParser(),
  lobbyID: PaimaParser.NCharsParser(12, 12),
  commitments: PaimaParser.NCharsParser(0, 1000),
};
const closedLobby: ParserRecord<ClosedLobbyInput> = {
  lobbyID: PaimaParser.NCharsParser(12, 12),
};
const submittedMoves: ParserRecord<SubmittedMovesInput> = {
  nftId: PaimaParser.NumberParser(),
  lobbyID: PaimaParser.NCharsParser(12, 12),
  matchWithinLobby: PaimaParser.NumberParser(0, SAFE_NUMBER),
  roundWithinMatch: PaimaParser.NumberParser(0, SAFE_NUMBER),
  move: PaimaParser.NCharsParser(0, 1000),
};
const practiceMoves: ParserRecord<PracticeMovesInput> = {
  lobbyID: PaimaParser.NCharsParser(12, 12),
  matchWithinLobby: PaimaParser.NumberParser(0, SAFE_NUMBER),
  roundWithinMatch: PaimaParser.NumberParser(0, SAFE_NUMBER),
};
const zombieScheduledData: ParserRecord<ZombieRound> = {
  renameCommand: 'scheduledData',
  effect: 'zombie',
  lobbyID: PaimaParser.NCharsParser(12, 12),
};
const userScheduledData: ParserRecord<UserStats> = {
  renameCommand: 'scheduledData',
  effect: 'stats',
  nftId: PaimaParser.NumberParser(),
  result: PaimaParser.RegexParser(/^[w|t|l]$/),
};

const parserCommands: Record<string, ParserRecord<ParsedSubmittedInput>> = {
  nftMint,
  cardPackBuy,
  createdLobby,
  joinedLobby,
  closedLobby,
  submittedMoves,
  practiceMoves,
  zombieScheduledData,
  userScheduledData,
};

const myParser = new PaimaParser(myGrammar, parserCommands);

function parse(s: string): ParsedSubmittedInput {
  try {
    const parsed = myParser.start(s);
    if (parsed.command === 'createdLobby') {
      const { creatorCommitments, ...rest } = parsed.args;
      return {
        input: parsed.command,
        ...(rest as any),
        creatorCommitments: new Uint8Array(Buffer.from(creatorCommitments as string, 'base64')),
      };
    }

    if (parsed.command === 'joinedLobby') {
      const { commitments, ...rest } = parsed.args;

      return {
        input: parsed.command,
        ...(rest as any),
        commitments: new Uint8Array(Buffer.from(commitments as string, 'base64')),
      };
    }

    return { input: parsed.command, ...parsed.args } as any;
  } catch (e) {
    console.log(e, 'Parsing error');
    return { input: 'invalidString' };
  }
}

export default parse;
