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
    const user1 = accounts[1];
    const user2 = accounts[2];
    const randomMaliciousUser = accounts[3];

    const starId = 0;
    const starPrice = web3.toWei(.01, 'ether');

    beforeEach(async () => {
      await this.contract.createStar(
        star.name, star.dec, star.mag, star.cent, star.story,
        { from: user1 }
      );
    });

    it('unauthorized user cannot put up a star for sale', async () => {
      assert.isOk(await checkRevertTraction(
        async () => this.contract.putStarUpForSale(starId, starPrice, { from: randomMaliciousUser })
      ));
    });

    it('user1 can put up their star for sale', async () => {
      assert.equal(await this.contract.ownerOf(starId), user1);
      await this.contract.putStarUpForSale(starId, starPrice, { from: user1 });

      assert.equal(await this.contract.starsForSale(starId), starPrice);
    });

    describe('user2 buy a star that was put up for sale', () => {
      beforeEach(async () => {
        await this.contract.putStarUpForSale(starId, starPrice, { from: user1 });
      });

      it('cannot buy a star not for sale', async () => {
        assert.isOk(await checkRevertTraction(
          async () => this.contract.buyStar(starId + 1, { from: user2, value: starPrice, gasPrice: 0 })
        ));
      });

      it('cannot buy a star with lower price', async () => {
        assert.isOk(await checkRevertTraction(
          async () => this.contract.buyStar(starId, { from: user2, value: starPrice / 2, gasPrice: 0 })
        ));
      });

      it('user2 is the owner of the star after they buy it', async () => {
        await this.contract.buyStar(starId, { from: user2, value: starPrice, gasPrice: 0 });
        assert.equal(await this.contract.ownerOf(starId), user2);
      });

      it('user2 ether balance changed correctly', async () => {
        let overpaidAmount = web3.toWei(.05, 'ether');
        const balanceBeforeTransaction = web3.eth.getBalance(user2);
        await this.contract.buyStar(starId, { from: user2, value: overpaidAmount, gasPrice: 0 });
        const balanceAfterTransaction = web3.eth.getBalance(user2);

        assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice);
      });
    });
  });
});
