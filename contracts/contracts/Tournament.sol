// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Tournament is ERC721 {
    struct Params {
        string name;
        uint game;
        string[] teamOnePlayers;
        string[] teamTwoPlayers;
        uint contributionAmount;
        address contributionToken;
        string code;
        bool isStarted;
        bool isTeamOneWon;
        bool isTeamTwoWon;
    }

    uint private _nextTokenId;
    mapping(uint tokenId => Params params) private _params;
    mapping(uint tokenId => mapping(string player => address playerAddress))
        private _contributions;

    constructor() ERC721("Tournament", "TRN") {}

    function create(
        string memory name,
        uint game,
        string[] memory teamOnePlayers,
        string[] memory teamTwoPlayers,
        uint contributionAmount,
        address contributionToken
    ) external {
        require(contributionAmount > 0, "Incorrect contribution amount");
        require(
            contributionToken != address(0),
            "Incorrect contribution token"
        );
        require(
            teamOnePlayers.length == teamTwoPlayers.length,
            "Incorrect teams"
        );
        uint tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _params[tokenId] = Params(
            name,
            game,
            teamOnePlayers,
            teamTwoPlayers,
            contributionAmount,
            contributionToken,
            "",
            false,
            false,
            false
        );
    }

    function contribute(uint tokenId, string memory player) external {
        require(
            !_params[tokenId].isTeamOneWon && !_params[tokenId].isTeamTwoWon,
            "Tournament is finished"
        );
        require(
            _contributions[tokenId][player] == address(0),
            "Already contributed"
        );
        IERC20 contributionToken = IERC20(_params[tokenId].contributionToken);
        require(
            contributionToken.allowance(msg.sender, address(this)) >=
                _params[tokenId].contributionAmount,
            "Allowance too low"
        );
        bool sent = contributionToken.transferFrom(
            msg.sender,
            address(this),
            _params[tokenId].contributionAmount
        );
        require(sent, "Token transfer failed");
        _contributions[tokenId][player] = msg.sender;
    }

    function start(uint tokenId, string memory code) external {
        require(msg.sender == _ownerOf(tokenId), "Not owner");
        require(!_params[tokenId].isStarted, "Already started");
        for (uint i = 0; i < _params[tokenId].teamOnePlayers.length; i++) {
            require(
                _contributions[tokenId][_params[tokenId].teamOnePlayers[i]] !=
                    address(0),
                "Team one is not ready"
            );
        }
        for (uint i = 0; i < _params[tokenId].teamTwoPlayers.length; i++) {
            require(
                _contributions[tokenId][_params[tokenId].teamTwoPlayers[i]] !=
                    address(0),
                "Team two is not ready"
            );
        }
        _params[tokenId].isStarted = true;
        _params[tokenId].code = code;
    }

    function finish(uint tokenId) external {
        require(msg.sender == _ownerOf(tokenId), "Not owner");
        require(
            !_params[tokenId].isTeamOneWon && !_params[tokenId].isTeamTwoWon,
            "Already finished"
        );
        // Define winners
        bool isTeamOneWon = false; // TODO: Use an oracle to determine the winner
        string[] memory winners;
        if (isTeamOneWon) {
            _params[tokenId].isTeamOneWon = true;
            winners = _params[tokenId].teamOnePlayers;
        } else {
            _params[tokenId].isTeamTwoWon = true;
            winners = _params[tokenId].teamTwoPlayers;
        }
        // Send reward to winners
        for (uint i = 0; i < winners.length; i++) {
            bool sent = IERC20(_params[tokenId].contributionToken).transfer(
                _contributions[tokenId][winners[i]],
                2 * _params[tokenId].contributionAmount
            );
            require(sent, "Token transfer failed");
        }
    }

    function getNextTokenId() external view returns (uint) {
        return _nextTokenId;
    }

    function getParams(uint tokenId) external view returns (Params memory) {
        return _params[tokenId];
    }

    function getContribution(
        uint tokenId,
        string memory player
    ) external view returns (address) {
        return _contributions[tokenId][player];
    }
}
