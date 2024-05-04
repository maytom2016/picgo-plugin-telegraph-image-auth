module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('telegraph-image-uploader', {
      handle,
      name: 'telegraph-image',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.telegraph-image-uploader')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    
    const uploadurl1 = new URL(userConfig.customUrl);
    const url1 = `${uploadurl1.protocol}//${uploadurl1.host}`;
    const uploadurl=uploadurl1.toString();
    const url=url1.toString();
    const customHeader=userConfig.customHeader;
    const customBody=userConfig.customBody;

    const paramName = "file"
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, uploadurl, paramName, imgList[i].fileName,customHeader,customBody)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        let imgUrl = url + JSON.parse(body)[0].src
        if (imgUrl) {
          imgList[i]['imgUrl'] = imgUrl
        } else {
          ctx.emit('notification', {
            title: '返回解析失败',
            body: body
          })
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (image, url, paramName, fileName,customHeader,customBody) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    if (customHeader) {
      headers = Object.assign(headers, JSON.parse(customHeader))
    }
    let formData = {}
    if (customBody) {
      formData = Object.assign(formData, JSON.parse(customBody))
    }
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData[paramName] = {}
    opts.formData[paramName].value = image
    opts.formData[paramName].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.telegraph-image-uploader')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'customUrl',
        type: 'input',
        default: userConfig.customUrl,
        required: true,
        message: '图片上传url(eg: https://tc.bian666.cf)',
        alias: 'URL'
      },
      {
        name: 'customHeader',
        type: 'input',
        default: userConfig.customHeader,
        required: false,
        message: '自定义请求头 标准JSON{"key":"value"},非专业勿改，保持空值',
        alias: '自定义请求头'
      },
      {
        name: 'customBody',
        type: 'input',
        default: userConfig.customBody,
        required: false,
        message: '自定义Body 标准JSON{"key":"value"},非专业勿改，保持空值',
        alias: '自定义Body'
      }
    ]
  }
  return {
    uploader: 'telegraph-image-uploader',
    register

  }
}
