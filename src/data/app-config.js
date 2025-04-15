export const APP_CONFIG = {
  general: {
    system_maintenance: {
      cancelable: true,
      enable: false,
      description_en:
        "Please aware that Vietcap system will be maintained from  05/10/2024.\\n We are sorry for the inconvinience during the maintenance.",
      description:
        "Vietcap tiến hành bảo trì và nâng cấp hệ thống từ 19:00 ngày 05/10 đến 12:00 ngày 06/10.",
      title_en: "System maintenance2",
      title: "Bảo trì hệ thống",
    },
    csr_campaign: {
      green_up_for_vn: {
        enable: false,
      },
    },
  },
  web: {
    general_announcement: {
      cancelable: true,
      enable: false,
      description_en:
        "This is general announcement. The content is dynamic according to our campaign.",
      action: "/cash-transfer/cash-deposit-qr-code?type=stock",
      description:
        "<p>Này là popup thông báo chung. Mn có thể điền nội dung tùy ý</p>",
      banner_url: "hello",
      title_en: "Notice",
      button_title: "Tim hiểu thêm",
      button_title_en: "Learn More",
      title: "Thông báo",
      banner_url_en:
        "https://www.shutterstock.com/image-photo/expressing-your-own-thoughts-on-600nw-2296251375.jpg",
    },
  },
  mobile: {
    general_announcement: {
      cancelable: true,
      enable: false,
      description_en:
        "English: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      screen: "VietcapIQ",
      banner_url:
        "https://firebasestorage.googleapis.com/v0/b/vietcap-uat.appspot.com/o/pexels-photo-39811.jpeg?alt=media&token=8b6ea32a-c888-4dc6-b6c0-f085d39eb584",
      title_en: "Private Invitation",
      button_title: "LearnNow",
      title: "Thông báo riêng",
    },
    test: {
      cancelable: true,
      enable: true,
      description_en: "",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      screen: "DigiPartnerOnboarding",
      banner_url:
        "https://images.pexels.com/photos/39811/pexels-photo-39811.jpeg",
      button_title: "Explore",
      title: "Tính năng mới",
    },
    campaign: {
      green_up: {
        isActive: true,
      },
    },
    force_update_app: {
      android: {
        app_url:
          "https://play.google.com/store/apps/details?id=com.vcsc.vietcap",
        cancelable: false,
        app_version: "2.14.0",
        enable: false,
      },
      ios: {
        app_url: "https://apps.apple.com/app/id6446997591",
        cancelable: false,
        app_version: "2.10.1",
        enable: false,
      },
    },
  },
};
