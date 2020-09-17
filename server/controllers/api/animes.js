const pinyin = require('pinyin')
const moment = require('moment')

const Anime = require('../../model/Anime')

module.exports = {

  /**
   * 获取列表部分数据
   * @param  {obejct} ctx
   */
  async getList(ctx) {
    let animes = await Anime.find({}, 'name cover tags region publish').lean()
    if (animes.length > 0) {
      animes.forEach((item) => {
        if (item.publish) {
          item.publish = moment(item.publish).format('YYYY-MM')
        }
      })
      ctx.status = 200
      ctx.body = {
        status: '1',
        results: animes
      }
    }

  },

  /**
   * 增加数据操作
   * @param   {obejct} ctx
   */
  async add(ctx) {
    const findname = await Anime.find({
      name: ctx.request.body.name
    })
    if (findname.length > 0) {
      ctx.status = 400
      ctx.body = {
        status: '-1',
        error: '名称重复!'
      }
    } else {
      const anime = ctx.request.body
      const newAnime = new Anime({
        name: anime.name,
        cover: anime.cover,
        pinyin: pinyin(anime.name, {
          style: pinyin.STYLE_INITIALS
        }),
        tags: anime.tags,
        staff: anime.staff,
        actor: anime.actor,
        introduction: anime.introduction,
        publish: anime.publish,
        region: anime.region,
      })
      await newAnime.save()
        .then(() => {
          ctx.status = 200
          ctx.body = {
            status: '1'
          }
        })
        .catch((error) => {
          ctx.status = 400
          ctx.body = {
            status: '-1',
            error
          }
        })
    }
  },

  /**
   * 删除信息
   * @param    {obejct} ctx
   */
  async delete(ctx) {
    await Anime.deleteOne({
      _id: ctx.params.id
    }, error => {
      if (error) {
        ctx.status = 400
        ctx.body = {
          status: '-1',
          error
        }
      } else {
        ctx.status = 200
        ctx.body = {
          status: '1',
          msg: '删除成功'
        }
      }
    })
  },

  /**
   * 修改信息
   * @param  {obejct} ctx
   */
  async change(ctx) {
    const new_anime = ctx.request.body.anime
    const changes = ctx.request.body.changes
    let updateFields = {}
    changes.forEach((i) => {
      updateFields[i] = new_anime[i]
    })

    await Anime.updateMany({
      _id: ctx.params.id
    }, updateFields, function (error) {
      if (error) {
        ctx.status = 400
        ctx.body = {
          status: '-1',
          error
        }
      } else {
        ctx.status = 200
        ctx.body = {
          status: '1',
        }

      }
    })

  },

  /**
   * 查询详细信息
   * @param  {obejct} ctx
   */
  async getDetail(ctx) {
    await Anime.findById(ctx.params.id).lean()
      .then((anime) => {
        if (anime) {
          anime.publish = moment(anime.publish).format('YYYY-MM')
          ctx.status = 200
          ctx.body = {
            results: anime,
            status: '1'
          }
        } else {
          ctx.status = 400
          ctx.body = {
            error: 'anime_id not find',
            status: '-1'
          }
        }
      }).catch((error) => {
        ctx.status = 500
        ctx.body = {
          error,
          status: '-1'
        }

      })

  }

}
