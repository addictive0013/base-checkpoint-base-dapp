// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseCheckpoint {
    uint256 public nextCheckpointId = 1;

    struct Checkpoint {
        address author;
        string lane;
        string title;
        string detail;
        uint256 createdAt;
    }

    mapping(uint256 => Checkpoint) private checkpoints;

    event CheckpointLogged(
        uint256 indexed checkpointId,
        address indexed author,
        string lane,
        string title,
        string detail
    );

    function logCheckpoint(
        string calldata lane,
        string calldata title,
        string calldata detail
    ) external returns (uint256 checkpointId) {
        require(bytes(lane).length > 0 && bytes(lane).length <= 24, "Invalid lane");
        require(bytes(title).length > 0 && bytes(title).length <= 56, "Invalid title");
        require(bytes(detail).length > 0 && bytes(detail).length <= 180, "Invalid detail");

        checkpointId = nextCheckpointId++;
        checkpoints[checkpointId] = Checkpoint({
            author: msg.sender,
            lane: lane,
            title: title,
            detail: detail,
            createdAt: block.timestamp
        });

        emit CheckpointLogged(checkpointId, msg.sender, lane, title, detail);
    }

    function getCheckpoint(
        uint256 checkpointId
    )
        external
        view
        returns (
            address author,
            string memory lane,
            string memory title,
            string memory detail,
            uint256 createdAt
        )
    {
        Checkpoint storage checkpoint = checkpoints[checkpointId];
        return (
            checkpoint.author,
            checkpoint.lane,
            checkpoint.title,
            checkpoint.detail,
            checkpoint.createdAt
        );
    }
}
