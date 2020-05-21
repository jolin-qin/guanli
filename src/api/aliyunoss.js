import request from '@/utils/request'
import * as $tool from '@/utils/shuxin-tool'
const OSS = require('ali-oss')

// 获取临时授权
export const getAliyunOssToken = () => {
  return request({
    url: '/storage/aliyun/osstoken',
    method: 'get'
  })
}

/**
 * 创建oss客户端对象
 */
export function createOssClient(value) {
  const that = this;
  return new Promise((resolve, reject) => {
    getAliyunOssToken().then(res => {
      let ossClient = new OSS({
        region: res.data.region,
        accessKeyId: res.data.accessKeyId,
        accessKeySecret: res.data.accessKeySecret,
        stsToken: res.data.stsToken,
        bucket: res.data.bucket
      });
      that.ossDomainName = res.data.ossDomainName;
      resolve(ossClient)
    })
  })
}


/**
 * 创建oss客户端对象
 */
export function upload(option) {
  let file = option.file
  const that = this
  //console.log('创建oss客户端对象  option:', option);
  //console.log('创建oss客户端对象  that:', that);

  return new Promise((resolve, reject) => {
    let date = $tool.dateFormat(new Date(), 'yyyyMMdd') // 当前时间
    let dateTime = $tool.dateFormat(new Date(), 'yyyyMMddhhmmss') // 当前时间
    let randomStr = $tool.randomString(4) //  4位随机字符串
    let extensionName = file.name.substr(file.name.indexOf('.')) // 文件扩展名
    let fileName = 'gameDevopsImgs/' + date + '/' + dateTime + '_' + randomStr + extensionName // 文件名字（相对于根目录的路径 + 文件名）
    // 执行上传
    that.createOssClient().then(client => {
      // 异步上传,返回数据
      resolve({
        fileName: file.name,
        fileUrl: fileName
      })
      // 上传处理
      // 分片上传文件
      client.multipartUpload(fileName, file, {
        progress: function(p) {
          let e = {}
          e.percent = Math.floor(p * 100)
          console.log('分片上传文件 Progress: ' + p)
          option.onProgress(e)
        }
      }).then((val) => {
        console.log('分片上传文件 响应：', val)
        if (val.res.statusCode === 200) {
          let urls= [];
          let uploadFileUrl = null;
          for(var index in val.res.requestUrls){
            console.log(val.res.requestUrls[index])
            // urls.push(val.res.requestUrls[index].split("?")[0])
            let newUrlPath = val.res.requestUrls[index]
            console.log(that.ossDomainName + newUrlPath.substring(newUrlPath.indexOf("/gameDevopsImgs")));
            urls.push(that.ossDomainName + newUrlPath.substring(newUrlPath.indexOf("/gameDevopsImgs")))
          }
          option.onSuccess(urls)
          return val
        } else {
          option.onError('上传失败')
        }
      }, err => {
        option.onError('上传失败')
        reject(err)
      })
    })
  })
}
