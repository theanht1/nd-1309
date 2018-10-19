const StarNotary = artifacts.require('StarNotary');


const checkRevertTraction = async (fn) => {
  try {
    await fn();
  } catch (e) {
    return true;
  }
  return false;
};

contract('StarNotary', accounts => {
  const star = {
    name: 'Star power 103!',
    dec: 'dec_121.874',
    mag: 'mag_245.978',
    cent: 'ra_032.155',
    story: 'I love my wonderful star',
  };
  const firstStarId = 0;
  const user1 = accounts[1];
  const user2 = accounts[2];
  const randomMaliciousUser = accounts[3];
  const starPrice = web3.toWei(.01, 'ether');

  beforeEach(async () => {
    this.contract = await StarNotary.new({ from: accounts[0] })
  });

  describe('can create a star', () => {
    it('can create a star and get its name', async () => {
      await this.contract.createStar(
        star.name, star.dec, star.mag, star.cent, star.story,
        { from: accounts[0] }
      );
      const createdStar = await this.contract.tokenIdToStarInfo(0);
      assert.equal(createdStar[0], star.name);
      assert.equal(createdStar[1], star.dec);
      assert.equal(createdStar[2], star.mag);
      assert.equal(createdStar[3], star.cent);
      assert.equal(createdStar[4], star.story);
    });

    it('cannot create duplicate coordinates star', async () => {
      await this.contract.createStar(star.name, star.dec, star.mag, star.cent, star.story, { from: accounts[0] });

      assert.isOk(await checkRevertTraction(
        async () => this.contract.createStar('star 2', star.dec, star.mag, star.cent, 'story 2', { from: accounts[0] })
      ));
    });
  });

  describe('buying and selling stars', () => {
    beforeEach(async () => {
      await this.contract.createStar(
        star.name, star.dec, star.mag, star.cent, star.story,
        { from: user1 }
      );
    });

    it('unauthorized user cannot put up a star for sale', async () => {
      assert.isOk(await checkRevertTraction(
        async () => this.contract.putStarUpForSale(firstStarId, starPrice, { from: randomMaliciousUser })
      ));
    });

    it('user1 can put up their star for sale', async () => {
      assert.equal(await this.contract.ownerOf(firstStarId), user1);
      await this.contract.putStarUpForSale(firstStarId, starPrice, { from: user1 });

      assert.equal(await this.contract.starsForSale(firstStarId), starPrice);
    });

    describe('buy a star that was put up for sale', () => {
      beforeEach(async () => {
        await this.contract.putStarUpForSale(firstStarId, starPrice, { from: user1 });
      });

      it('cannot buy a star not for sale', async () => {
        assert.isOk(await checkRevertTraction(
          async () => this.contract.buyStar(firstStarId + 1, { from: user2, value: starPrice, gasPrice: 0 })
        ));
      });

      it('cannot buy a star with lower price', async () => {
        assert.isOk(await checkRevertTraction(
          async () => this.contract.buyStar(firstStarId, { from: user2, value: starPrice / 2, gasPrice: 0 })
        ));
      });

      it('user2 is the owner of the star after they buy it', async () => {
        await this.contract.buyStar(firstStarId, { from: user2, value: starPrice, gasPrice: 0 });
        assert.equal(await this.contract.ownerOf(firstStarId), user2);
      });

      it('user2 ether balance changed correctly', async () => {
        let overpaidAmount = web3.toWei(.05, 'ether');
        const balanceBeforeTransaction = web3.eth.getBalance(user2);
        await this.contract.buyStar(firstStarId, { from: user2, value: overpaidAmount, gasPrice: 0 });
        const balanceAfterTransaction = web3.eth.getBalance(user2);

        assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice);
      });
    });
  });

  describe('should be a ERC721 token', () => {
    beforeEach(async () => {
      await this.contract.createStar(
        star.name, star.dec, star.mag, star.cent, star.story,
        { from: user1 }
      );
    });

    it('can be mint as a star token', async () => {
      assert.equal(await this.contract.ownerOf(firstStarId), user1);
    });

    it('can be approve for other', async () => {
      await this.contract.approve(user2, firstStarId, { from: user1 });
      assert.equal(await this.contract.getApproved(firstStarId), user2);
    });

    it('can be approve all token', async () => {
      await this.contract.setApprovalForAll(user2, true, { from: user1 });
      assert.equal(await this.contract.isApprovedForAll(user1, user2), true);

      await this.contract.setApprovalForAll(user2, false, { from: user1 });
      assert.equal(await this.contract.isApprovedForAll(user1, user2), false);
    });

    it('can be transfer', async () => {
      await this.contract.approve(user2, firstStarId, { from: user1 });
      await this.contract.transferFrom(user1, user2, firstStarId, { from: user2 });

      assert.equal(await this.contract.ownerOf(firstStarId), user2);
    });

    it('can be safe transfer', async () => {
      await this.contract.approve(user2, firstStarId, { from: user1 });
      await this.contract.safeTransferFrom(user1, user2, firstStarId, { from: user2 });

      assert.equal(await this.contract.ownerOf(firstStarId), user2);
    });
  });
});
