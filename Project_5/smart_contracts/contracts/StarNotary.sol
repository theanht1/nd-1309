pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string dec;
        string mag;
        string cent;
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    uint256 public starId;

    //
    // Public methods
    //
    function createStar(string _name, string _dec, string _mag, string _cent, string _story) public {
        require(checkIfStarExist(_dec, _mag, _cent));

        Star memory newStar = Star(_name, _dec, _mag, _cent, _story);
        tokenIdToStarInfo[starId] = newStar;

        _mint(msg.sender, starId);
        starId++;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function checkIfStarExist(string _dec, string _mag, string _cent) public view returns(bool) {
        for (uint id = 0; id < starId; id++) {
            Star memory star = tokenIdToStarInfo[id];
            if (keccak256(abi.encodePacked(star.dec)) == keccak256(abi.encodePacked(_dec))
                && keccak256(abi.encodePacked(star.mag)) == keccak256(abi.encodePacked(_mag))
                && keccak256(abi.encodePacked(star.cent)) == keccak256(abi.encodePacked(_cent))) {
                return true;
            }
        }
        return false;
    }

    // function starsForSale(uint _tokenId) public view returns(uint256) {
    //     return starsForSale[_tokenId];
    // }

    // function tokenIdToStarInfo(uint256 _tokenId) public view returns(Star) {
    //     return tokenIdToStarInfo[_tokenId];
    // }
}
