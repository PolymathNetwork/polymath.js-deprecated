// @flow

/**
* The template reputation is a struct that represents a legal compliance template. It records who has used the template, when it expires, how many times it has been used, the total POLY raised by this template, and the owner of the template.
*
* @example
* Struct TemplateReputation
* {
*   "owner": "0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83E",
*   "totalRaised": 1000000,
*   "timesUsed": 5,
*   "expires": 1515106232,
*   "usedBy": "["0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe", "0x5ec4223fBF9D4C4A1067a91FE381369852a6FB08"]"
* },
*/
type TemplateReputation = Struct | {owner: string, totalRaised: number, timesUsed: number, expires: number, usedBy: string[]} | [string, number, number, number, string[]];


/**
*Log args
*
* @example
* Log Args
* },
*/
type Log<LogArgs> = {
    args: LogArgs,
    address: string,
    blockHash: ?string,
    blockNumber: ?number,
    data: string,
    event: string,
    logIndex: ?number,
    topics: Array<string>,
    transactionHash: string,
    transactionIndex: ?number,
  }