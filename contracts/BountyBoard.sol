// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BountyBoard {
    enum Status { Open, Claimed, Completed }

    struct Bounty {
        uint256 id;
        address poster;
        address claimer;
        string title;
        string description;
        uint256 reward;
        Status status;
        uint256 createdAt;
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;
    mapping(address => uint256) public reputation;

    event BountyPosted(uint256 indexed id, address indexed poster, string title, uint256 reward);
    event BountyClaimed(uint256 indexed id, address indexed claimer);
    event BountyCompleted(uint256 indexed id, address indexed claimer, uint256 reward);

    modifier onlyPoster(uint256 _id) {
        require(bounties[_id].poster == msg.sender, "Only poster can call this");
        _;
    }

    function postBounty(string calldata _title, string calldata _description) external payable {
        require(msg.value > 0, "Must send AVAX as reward");
        require(bytes(_title).length > 0, "Title required");

        bountyCount++;
        bounties[bountyCount] = Bounty({
            id: bountyCount,
            poster: msg.sender,
            claimer: address(0),
            title: _title,
            description: _description,
            reward: msg.value,
            status: Status.Open,
            createdAt: block.timestamp
        });

        emit BountyPosted(bountyCount, msg.sender, _title, msg.value);
    }

    function claimBounty(uint256 _id) external {
        Bounty storage bounty = bounties[_id];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == Status.Open, "Bounty not open");
        require(bounty.poster != msg.sender, "Poster cannot claim own bounty");

        bounty.claimer = msg.sender;
        bounty.status = Status.Claimed;

        emit BountyClaimed(_id, msg.sender);
    }

    function completeBounty(uint256 _id) external onlyPoster(_id) {
        Bounty storage bounty = bounties[_id];
        require(bounty.status == Status.Claimed, "Bounty not claimed");

        bounty.status = Status.Completed;
        reputation[bounty.claimer]++;

        (bool sent, ) = payable(bounty.claimer).call{value: bounty.reward}("");
        require(sent, "Failed to send AVAX");

        emit BountyCompleted(_id, bounty.claimer, bounty.reward);
    }

    function getAllBounties() external view returns (Bounty[] memory) {
        Bounty[] memory all = new Bounty[](bountyCount);
        for (uint256 i = 1; i <= bountyCount; i++) {
            all[i - 1] = bounties[i];
        }
        return all;
    }

    function getReputation(address _user) external view returns (uint256) {
        return reputation[_user];
    }
}
