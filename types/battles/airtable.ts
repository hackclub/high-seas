import { FieldSet } from "airtable";

export interface Ships extends FieldSet {
  id?: string;
  identifier?: string;
  title: string;
  hours: number;
  rating?: number;
  entrant: string[];
  contest?: string[];
  repo_url: string;
  readme_url: string;
  deploy_url: string;
  matchups?: string[];
  matchups_count?: number;
  wins?: string[];
  wins_adjustments?: number;
  losses?: string[];
  losses_adjustments?: number;
  autonumber?: number;
  screenshot_url: string;
  entrant__slack_id: string[];
}

export interface Battles extends FieldSet {
  identifier: string;
  contest: string[];
  voter: string[];
  ships: string[];
  explanation: string;
  winner: string[];
  winner_rating: number;
  winner_adjustment: number;
  loser: string[];
  loser_rating: number;
  loser_adjustment: number;
}

export interface Person extends FieldSet {
  id?: string;
  identifier?: string;
  first_name: string;
  last_name: string;
  email: string;
  slack_id: string;
  verification_status?: string;
}