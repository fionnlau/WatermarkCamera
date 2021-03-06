let cropper = null;
Page({
  data: {
    myImg:'',
    urls:'',
    cropperOrImg:true,
    yesOrSave: true,
    windowWidth: '',
    windowHeight: '',
    imgWidth:'',
    imgHeight: '',
  },
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        })
      },
    })
    that.setData({
      cropperOrImg: true,
      yesOrSave:true
    })
    wx.getStorage({
      key: 'myImg',
      success: function(res) {
        cropper = that.selectComponent('#cropper');
        cropper.fnInit({
          imagePath: res.data[0],       //*必填
          debug: true,                        //可选。是否启用调试，默认值为false。true：打印过程日志；false：关闭过程日志
          outputFileType: 'jpg',              //可选。目标文件的类型。默认值为jpg，jpg：输出jpg格式图片；png：输出png格式图片
          quality: 1,                         //可选。图片的质量。默认值为1，即最高质量。目前仅对 jpg 有效。取值范围为 (0, 1]，不在范围内时当作 1.0 处理。
          aspectRatio: null,                  //可选。裁剪的宽高比，默认null，即不限制剪裁宽高比。aspectRatio需大于0
          minBoxWidthRatio: 0.2,              //可选。最小剪裁尺寸与原图尺寸的比率，默认0.15，即宽度最小剪裁到原图的0.15宽。
          minBoxHeightRatio: 0.2,             //可选。同minBoxWidthRatio，当设置aspectRatio时，minBoxHeight值设置无效。minBoxHeight值由minBoxWidth 和 aspectRatio自动计算得到。
          initialBoxWidthRatio: 0.6,          //可选。剪裁框初始大小比率。默认值0.6，即剪裁框默认宽度为图片宽度的0.6倍。
          initialBoxHeightRatio: 0.6          //可选。同initialBoxWidthRatio，当设置aspectRatio时，initialBoxHeightRatio值设置无效。initialBoxHeightRatio值由initialBoxWidthRatio 和 aspectRatio自动计算得到。
        });

      },
    })
    

  },

  ////////  cancel ///////////////////
  fnCancel:function(){
    console.log('cancel')
    wx.navigateBack({
      delta: 1
    })
  },

////////// do crop ////////////////////
  fnSubmit:function(){
    var that = this
    wx.showLoading({
      title: '请耐心等待',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
    cropper.fnCrop({
      //剪裁成功的回调
      success:function(res){
        that.setData({
          urls: res.tempFilePath,
          cropperOrImg: false,
          yesOrSave: false
        })
        
      },
    });
  },
  fnSave:function(){
    var that = this
    wx.showLoading({
      title: '保存相册中',
    })
    setTimeout(function () {
      wx.saveImageToPhotosAlbum({
        filePath: that.data.urls,
      })
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
      })
    }, 500)
  }
})